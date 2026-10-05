begin;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role text not null default 'member' check (role in ('member', 'admin', 'superadmin')),
  avatar_path text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_avatar_path_owner check (
    avatar_path is null or avatar_path ~ (
      '^' || user_id::text || '/avatar(-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?\.(jpg|png|webp)$'
    )
  ),
  constraint profiles_no_public_avatar_url check (avatar_url is null)
);

create index if not exists profiles_role_idx on public.profiles(role);

create or replace function public.app_role_for_user(target_user_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case
    when u.raw_app_meta_data ->> 'role' in ('member', 'admin', 'superadmin')
      then u.raw_app_meta_data ->> 'role'
    else 'member'
  end
  from auth.users as u where u.id = target_user_id;
$$;

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = '' as $$
  select coalesce(public.app_role_for_user(auth.uid()), 'member');
$$;

create or replace function public.can_view_profile_avatar(target_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and target_user_id is not null and (
    target_user_id = auth.uid()
    or case public.current_app_role()
      when 'member' then 1 when 'admin' then 2 when 'superadmin' then 3 else 0
    end >= case public.app_role_for_user(target_user_id)
      when 'member' then 1 when 'admin' then 2 when 'superadmin' then 3 else 4
    end
  );
$$;

create or replace function public.ensure_auth_user_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'role', '') not in ('member', 'admin', 'superadmin') then
    new.raw_app_meta_data := jsonb_set(coalesce(new.raw_app_meta_data, '{}'::jsonb), '{role}', '"member"'::jsonb, true);
  end if;
  return new;
end;
$$;

create or replace function public.sync_profile_from_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  profile_name text;
begin
  profile_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Nexora member'
  );
  insert into public.profiles (id, user_id, full_name, email, role)
  values (new.id, new.id, profile_name, new.email, public.app_role_for_user(new.id))
  on conflict (user_id) do update
  set full_name = excluded.full_name, email = excluded.email,
      role = excluded.role, updated_at = now();
  return new;
end;
$$;

create or replace function public.touch_profile_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_user_role(target_user_id uuid, new_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if new_role is null or new_role not in ('member', 'admin', 'superadmin') then
    raise exception 'Invalid application role';
  end if;
  update auth.users
  set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', to_jsonb(new_role), true)
  where id = target_user_id;
  if not found then raise exception 'User not found'; end if;
end;
$$;

create or replace function public.list_visible_profiles()
returns table (user_id uuid, full_name text, role text, created_at timestamptz, avatar_path text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  return query
  select p.user_id, p.full_name, public.app_role_for_user(p.user_id), p.created_at,
         case when public.can_view_profile_avatar(p.user_id) then p.avatar_path else null end
  from public.profiles as p
  order by p.full_name, p.user_id;
end;
$$;

revoke all on function public.app_role_for_user(uuid) from public, anon, authenticated;
revoke all on function public.current_app_role() from public, anon;
revoke all on function public.can_view_profile_avatar(uuid) from public, anon;
revoke all on function public.ensure_auth_user_role() from public, anon, authenticated;
revoke all on function public.sync_profile_from_auth_user() from public, anon, authenticated;
revoke all on function public.touch_profile_updated_at() from public, anon, authenticated;
revoke all on function public.set_user_role(uuid, text) from public, anon, authenticated;
revoke all on function public.list_visible_profiles() from public, anon;
grant execute on function public.current_app_role() to authenticated, service_role;
grant execute on function public.can_view_profile_avatar(uuid) to authenticated, service_role;
grant execute on function public.list_visible_profiles() to authenticated;
grant execute on function public.set_user_role(uuid, text) to service_role;

drop trigger if exists auth_users_default_role on auth.users;
create trigger auth_users_default_role before insert or update of raw_app_meta_data on auth.users
for each row execute function public.ensure_auth_user_role();
drop trigger if exists auth_users_sync_profile on auth.users;
create trigger auth_users_sync_profile after insert or update of email, raw_user_meta_data, raw_app_meta_data on auth.users
for each row execute function public.sync_profile_from_auth_user();
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_profile_updated_at();

update auth.users
set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"member"'::jsonb, true)
where coalesce(raw_app_meta_data ->> 'role', '') not in ('member', 'admin', 'superadmin');

insert into public.profiles (id, user_id, full_name, email, role)
select u.id, u.id,
       coalesce(nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
                nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
                nullif(split_part(coalesce(u.email, ''), '@', 1), ''), 'Nexora member'),
       u.email, public.app_role_for_user(u.id)
from auth.users as u
on conflict (user_id) do update
set full_name = excluded.full_name, email = excluded.email,
    role = excluded.role, updated_at = now();

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select (id, user_id, full_name, email, role, avatar_path, avatar_url, created_at, updated_at)
  on public.profiles to authenticated;
grant insert (id, user_id, full_name, email, role, avatar_path) on public.profiles to authenticated;
grant update (full_name, avatar_path) on public.profiles to authenticated;
grant delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists profiles_insert_own_role on public.profiles;
create policy profiles_insert_own_role on public.profiles for insert to authenticated
with check (
  user_id = (select auth.uid()) and role = (select public.current_app_role())
  and (avatar_path is null or avatar_path ~ ('^' || (select auth.uid())::text || '/avatar(-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?\.(jpg|png|webp)$'))
);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid()) and role = (select public.current_app_role()) and avatar_url is null
  and (avatar_path is null or avatar_path ~ ('^' || (select auth.uid())::text || '/avatar(-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?\.(jpg|png|webp)$'))
);
drop policy if exists profiles_delete_disabled on public.profiles;
create policy profiles_delete_disabled on public.profiles for delete to authenticated using (false);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-images', 'profile-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
alter table storage.objects enable row level security;

drop policy if exists profile_images_select_by_role on storage.objects;
create policy profile_images_select_by_role on storage.objects for select to authenticated
using (
  bucket_id = 'profile-images' and case
    when name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/avatar(-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?\.(jpg|png|webp)$'
      then public.can_view_profile_avatar(split_part(name, '/', 1)::uuid)
    else false
  end
);
drop policy if exists profile_images_insert_own on storage.objects;
create policy profile_images_insert_own on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-images' and name ~ ('^' || (select auth.uid())::text || '/avatar(-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?\.(jpg|png|webp)$')
);
drop policy if exists profile_images_update_own on storage.objects;
create policy profile_images_update_own on storage.objects for update to authenticated
using (bucket_id = 'profile-images' and name ~ ('^' || (select auth.uid())::text || '/avatar(-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?\.(jpg|png|webp)$'))
with check (bucket_id = 'profile-images' and name ~ ('^' || (select auth.uid())::text || '/avatar(-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?\.(jpg|png|webp)$'));
drop policy if exists profile_images_delete_own on storage.objects;
create policy profile_images_delete_own on storage.objects for delete to authenticated
using (bucket_id = 'profile-images' and name ~ ('^' || (select auth.uid())::text || '/avatar(-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?\.(jpg|png|webp)$'));

commit;

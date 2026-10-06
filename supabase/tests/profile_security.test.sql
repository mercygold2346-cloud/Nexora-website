begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(50);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'member-a@test.invalid', '', now(), '{"role":"member"}', '{"full_name":"Member A"}'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'member-b@test.invalid', '', now(), '{"role":"member"}', '{"full_name":"Member B"}'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'admin-a@test.invalid', '', now(), '{"role":"admin"}', '{"full_name":"Admin A"}'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'admin-b@test.invalid', '', now(), '{"role":"admin"}', '{"full_name":"Admin B"}'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'super-a@test.invalid', '', now(), '{"role":"superadmin"}', '{"full_name":"Superadmin A"}'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'super-b@test.invalid', '', now(), '{"role":"superadmin"}', '{"full_name":"Superadmin B"}')
on conflict (id) do nothing;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'google-new@test.invalid', '', now(), '{"provider":"google","providers":["google"]}', '{"full_name":"Google New"}')
on conflict (id) do nothing;

select is((select raw_app_meta_data ->> 'role' from auth.users where id = '10000000-0000-0000-0000-000000000007'), 'member', 'new Google account defaults to member');
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"picture":"https://example.test/admin.png"}'::jsonb
where id = '10000000-0000-0000-0000-000000000003';
select is((select raw_app_meta_data ->> 'role' from auth.users where id = '10000000-0000-0000-0000-000000000003'), 'admin', 'Google metadata update preserves existing admin role');
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"picture":"https://example.test/superadmin.png"}'::jsonb
where id = '10000000-0000-0000-0000-000000000005';
select is((select raw_app_meta_data ->> 'role' from auth.users where id = '10000000-0000-0000-0000-000000000005'), 'superadmin', 'Google metadata update preserves existing superadmin role');

update public.profiles set avatar_path = user_id::text || '/avatar.png'
where user_id between '10000000-0000-0000-0000-000000000001' and '10000000-0000-0000-0000-000000000006';

insert into storage.objects (bucket_id, name, metadata)
values
  ('profile-images', '10000000-0000-0000-0000-000000000001/avatar.png', '{"mimetype":"image/png"}'),
  ('profile-images', '10000000-0000-0000-0000-000000000002/avatar.png', '{"mimetype":"image/png"}'),
  ('profile-images', '10000000-0000-0000-0000-000000000003/avatar.png', '{"mimetype":"image/png"}'),
  ('profile-images', '10000000-0000-0000-0000-000000000004/avatar.png', '{"mimetype":"image/png"}'),
  ('profile-images', '10000000-0000-0000-0000-000000000005/avatar.png', '{"mimetype":"image/png"}'),
  ('profile-images', '10000000-0000-0000-0000-000000000006/avatar.png', '{"mimetype":"image/png"}')
on conflict (bucket_id, name) do nothing;

select has_table('public', 'profiles', 'profiles table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles RLS is enabled');
select ok((select not b.public from storage.buckets as b where b.id = 'profile-images'), 'profile image bucket is private');
select is((select allowed_mime_types from storage.buckets where id = 'profile-images'), array['image/jpeg', 'image/png', 'image/webp']::text[], 'bucket accepts only approved image MIME types');
select is((select file_size_limit from storage.buckets where id = 'profile-images'), 5242880::bigint, 'bucket enforces the 5 MB image limit');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000001'), true, 'member can view own image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000002'), true, 'member can view another member image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000003'), false, 'member cannot view admin image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000005'), false, 'member cannot view superadmin image');
select is((select avatar_path from public.list_visible_profiles() where user_id = '10000000-0000-0000-0000-000000000003'), null::text, 'member list omits admin image path');
select is((select avatar_path from public.list_visible_profiles() where user_id = '10000000-0000-0000-0000-000000000001'), '10000000-0000-0000-0000-000000000001/avatar.png', 'member list includes own image path');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000003'), true, 'admin can view own image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000001'), true, 'admin can view member image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000004'), true, 'admin can view another admin image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000005'), false, 'admin cannot view superadmin image');
select is((select avatar_path from public.list_visible_profiles() where user_id = '10000000-0000-0000-0000-000000000005'), null::text, 'admin list omits superadmin image path');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', true);
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000002'), true, 'superadmin can view member image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000003'), true, 'superadmin can view admin image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000006'), true, 'superadmin can view another superadmin image');
select is(public.can_view_profile_avatar('10000000-0000-0000-0000-000000000005'), true, 'superadmin can view own image');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*)::integer from public.profiles), 1, 'direct profile reads expose only the current user row');
select is((select count(*)::integer from public.list_visible_profiles() where user_id between '10000000-0000-0000-0000-000000000001' and '10000000-0000-0000-0000-000000000006'), 6, 'member sees all role profile cards');
select lives_ok($$update public.profiles set full_name = 'Member A updated', avatar_path = '10000000-0000-0000-0000-000000000001/avatar-33333333-3333-3333-3333-333333333333.webp' where user_id = '10000000-0000-0000-0000-000000000001'$$, 'member can update own profile and avatar path');
select is((with changed as (update public.profiles set full_name = 'Unauthorized' where user_id = '10000000-0000-0000-0000-000000000003' returning 1) select count(*)::integer from changed), 0, 'member cannot update another profile');
select throws_ok($$insert into public.profiles (id, user_id, full_name, role) values ('10000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Forged Admin', 'member')$$, '42501', null, 'member cannot insert a profile for another user');
select is((with deleted as (delete from public.profiles where user_id = '10000000-0000-0000-0000-000000000001' returning 1) select count(*)::integer from deleted), 0, 'authenticated users cannot delete required profile rows');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000001/avatar.png'), 1, 'member can read own Storage object');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000003/avatar.png'), 0, 'member cannot read admin Storage object');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000005/avatar.png'), 0, 'member cannot read superadmin Storage object');
select lives_ok($$insert into storage.objects (bucket_id, name, metadata) values ('profile-images', '10000000-0000-0000-0000-000000000001/avatar-11111111-1111-1111-1111-111111111111.png', '{"mimetype":"image/png"}')$$, 'member can upload to own folder');
select throws_ok($$insert into storage.objects (bucket_id, name, metadata) values ('profile-images', '10000000-0000-0000-0000-000000000002/avatar-22222222-2222-2222-2222-222222222222.png', '{"mimetype":"image/png"}')$$, '42501', null, 'member cannot upload to another folder');
select lives_ok($$update storage.objects set metadata = '{"mimetype":"image/png","updated":true}' where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000001/avatar.png'$$, 'member can update own image object');
select is((with changed as (update storage.objects set metadata = '{"changed":true}' where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000003/avatar.png' returning 1) select count(*)::integer from changed), 0, 'member cannot update another user image');
select lives_ok($$delete from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000001/avatar.png'$$, 'member can delete own image object');
select is((with deleted as (delete from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000003/avatar.png' returning 1) select count(*)::integer from deleted), 0, 'member cannot delete another user image');
select throws_ok($$select public.set_user_role('10000000-0000-0000-0000-000000000001', 'admin')$$, '42501', null, 'member cannot promote themselves to admin');
select throws_ok($$select public.set_user_role('10000000-0000-0000-0000-000000000001', 'superadmin')$$, '42501', null, 'member cannot promote themselves to superadmin');
select throws_ok($$update public.profiles set role = 'admin' where user_id = '10000000-0000-0000-0000-000000000001'$$, '42501', null, 'member cannot edit their profile role');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select is((select count(*)::integer from public.list_visible_profiles() where user_id between '10000000-0000-0000-0000-000000000001' and '10000000-0000-0000-0000-000000000006'), 6, 'admin sees all role profile cards');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000002/avatar.png'), 1, 'admin can read member Storage object');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000004/avatar.png'), 1, 'admin can read another admin Storage object');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000005/avatar.png'), 0, 'admin cannot read superadmin Storage object');
select throws_ok($$select public.set_user_role('10000000-0000-0000-0000-000000000003', 'superadmin')$$, '42501', null, 'admin cannot promote themselves to superadmin');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', true);
select is((select count(*)::integer from public.list_visible_profiles() where user_id between '10000000-0000-0000-0000-000000000001' and '10000000-0000-0000-0000-000000000006'), 6, 'superadmin sees all role profile cards');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000002/avatar.png'), 1, 'superadmin can read member Storage object');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000003/avatar.png'), 1, 'superadmin can read admin Storage object');
select is((select count(*)::integer from storage.objects where bucket_id = 'profile-images' and name = '10000000-0000-0000-0000-000000000006/avatar.png'), 1, 'superadmin can read superadmin Storage object');

select * from finish();
rollback;

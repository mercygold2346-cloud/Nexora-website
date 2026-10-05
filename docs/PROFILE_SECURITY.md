# Profile and Image Security

## Schema and Role Authority

Apply `supabase/migrations/20261005000000_secure_profiles_and_avatars.sql` to the Supabase project. It creates one `public.profiles` row per `auth.users` row, keyed by a unique `user_id` foreign key. Profiles store `full_name`, `email`, a constrained `role`, `avatar_path`, a permanently null `avatar_url`, and timestamps. A role index supports profile filtering. Auth triggers create and synchronize profiles, including existing users.

The authoritative role is `auth.users.raw_app_meta_data.role`, which users cannot modify through the normal Auth user API. The three valid values are `member`, `admin`, and `superadmin`. `profiles.role` is a synchronized display/index mirror and is not editable by authenticated clients. `public.set_user_role(target_user_id, new_role)` is executable only by `service_role`; call it only from a trusted server process. For example, a backend-only Supabase Admin client can call:

```js
await supabaseAdmin.rpc('set_user_role', {
	target_user_id: userId,
	new_role: 'admin',
})
```

Never ship a service-role key to the browser. New users default to `member`.

The hierarchy is `member < admin < superadmin`. A viewer can retrieve an image if they are the owner or their role is at least the target's role.

## Profile and Image Authorization

Direct `profiles` SELECT is limited to the current user's row. That is intentional: PostgreSQL RLS is row-based and would otherwise expose `avatar_path` alongside a visible profile. The authenticated-only `list_visible_profiles()` RPC returns non-sensitive directory fields and returns `avatar_path` only when the caller's server-derived role permits the image. It does not return email or permanent URLs.

Images live in the private `profile-images` bucket at `{auth.uid()}/avatar-{uuid}.{jpg|png|webp}`. The bucket enforces a 5 MiB maximum and the JPEG, PNG, and WebP MIME allowlist. Storage SELECT policies apply the role matrix independently; INSERT, UPDATE, and DELETE policies require the authenticated user's UUID folder and the approved object path. Profile RLS also limits avatar path updates to that user's folder. The UI requests a 120-second signed URL only for paths returned by the RPC; Storage RLS is still authoritative when that URL is created. `avatar_url` is constrained to NULL so permanent public URLs are never stored.

The profile-image CRUD service derives the owner from `supabase.auth.getUser()`, validates MIME and size, uploads a new version, updates only the current profile, then removes the previous object. Deletion removes the owned object and clears only the current user's path. Signed URLs last 60 seconds. The database trigger creates the profile; users cannot delete profile rows or alter their role.

## Adding a Role

Add a migration that updates the role allowlist in the auth-user trigger, `profiles.role` constraint, trusted role helper, and hierarchy rank used by `can_view_profile_avatar()`. Update the Storage visibility policy, role badges, and `supabase/tests/profile_security.test.sql` in the same change. Keep role assignment service-only. Do not add a client-side role selector or trust `user_metadata`.

## Security Tests

Install the Supabase CLI and Docker, then run:

```powershell
supabase start
supabase test db
```

The pgTAP suite in `supabase/tests/profile_security.test.sql` exercises the full image visibility matrix, sanitized path results, private bucket settings, Storage read/write ownership, and role escalation denials. From this repository, `npm run test:security` invokes the same command. Apply migrations to a linked project with `supabase db push` only after reviewing the target project and migration diff.

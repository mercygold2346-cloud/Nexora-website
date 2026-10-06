# Nexora

Nexora is a responsive, multi-page team workspace demo built with React and Vite. The `main` branch carries the blue-purple palette; `master` carries the same application with an emerald-teal palette. The only branch-specific file is `src/styles/theme.css`.

## Run locally

```powershell
npm install
npm run dev
```

Vite prints the local URL. Create a production build with `npm run build`.

## Pages

- Home, About, Services, Pricing, and Contact
- Login and Register
- Member dashboard, Admin console, People directory, and Profile & settings

Email and password registration, login, session restoration, logout, and password recovery use Supabase Auth. Configure these values in the ignored `.env.local` file before starting Vite:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

In Supabase Authentication settings, enable email sign-ups and add the local app origins to the allowed redirect URLs, including `/dashboard`, `/reset-password`, and `/auth/callback`. Google and Discord sign-in both use the shared `/auth/callback` route. Enable each provider under Supabase Authentication > Providers, enter that provider's client ID and secret in Supabase, and register the Supabase callback URL shown in the provider settings with the Google or Discord developer console. Set the Supabase Site URL to the production app origin and add the exact local and production `/auth/callback` URLs to its redirect allowlist. The frontend builds the callback URL from the current origin. Keep provider secrets in Supabase, never in frontend code.

Email confirmation is sent by Supabase, not the frontend. Configure a production SMTP provider in Supabase Auth email settings for delivery to arbitrary Gmail addresses, and inspect Supabase Auth logs if delivery fails. Local Supabase development captures auth emails in its local email testing service instead of sending them to real inboxes. The registration page supports requesting another confirmation link.

Login accepts email/password or Google without asking users to choose a role. After authentication, the app reads the role from the authenticated `current_app_role()` database function and routes accordingly. New accounts default to `member`; existing valid roles are preserved. Apply the Supabase migrations before using role routing, profiles, or `/users`. Role changes use the service-only database function described in [the profile security guide](docs/PROFILE_SECURITY.md). Never put a service-role key in browser code or use editable `user_metadata` for authorization.

Profiles and profile images use PostgreSQL RLS and a private Supabase Storage bucket. The `/users` directory receives profile-image paths only when the backend visibility policy permits them. Workspace projects, activity, and notification preferences remain unimplemented. The Contact form validates in the browser but does not send or save submissions. Terms still need to be configured.

Run database security tests with `npm run test:security` after installing the Supabase CLI and Docker. See [the profile security guide](docs/PROFILE_SECURITY.md) for schema, policies, role assignment, storage, and test setup.

Google-created accounts receive the default `member` role. Admin and superadmin roles must still be granted through the trusted server-side role process; Google sign-in does not accept a client-selected role.

## Theme branches

All palette tokens are centralized in `src/styles/theme.css`. To compare versions locally:

```powershell
git switch main
npm run dev
git switch master
npm run dev
```

Keep page content, routes, components, and behavior identical across branches; change only the theme token values when creating another palette.

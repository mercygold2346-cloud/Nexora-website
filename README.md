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
- Dashboard and Profile & settings

Email and password registration, login, session restoration, logout, and password recovery use Supabase Auth. Configure these values in the ignored `.env.local` file before starting Vite:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

In Supabase Authentication settings, enable email sign-ups and add `http://localhost:5173/**` and `http://127.0.0.1:5173/**` to the allowed redirect URLs (including `/dashboard` and `/reset-password`). Restart Vite after changing environment values. Never put the Supabase `service_role` key in the browser app.

The dashboard and profile display data from the signed-in Supabase Auth user. Workspace projects, activity, and notification preferences remain empty until database tables and Row Level Security policies are added. The Contact form validates in the browser but does not send or save submissions. Terms still need to be configured.

## Theme branches

All palette tokens are centralized in `src/styles/theme.css`. To compare versions locally:

```powershell
git switch main
npm run dev
git switch master
npm run dev
```

Keep page content, routes, components, and behavior identical across branches; change only the theme token values when creating another palette.

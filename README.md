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

The dashboard is protected by a browser-only demo session. The auth module is isolated in `src/auth/authService.js` so a real identity provider can replace it. Credentials are not checked by a server, and profile/session values in browser storage are not secure authentication. Do not use real passwords or personal data.

The Contact form validates in the browser but does not send data to a backend. The password recovery and terms links are also demo placeholders.

## Theme branches

All palette tokens are centralized in `src/styles/theme.css`. To compare versions locally:

```powershell
git switch main
npm run dev
git switch master
npm run dev
```

Keep page content, routes, components, and behavior identical across branches; change only the theme token values when creating another palette.

# PLLI Voting Hub — PWA prototype

This is a runnable **static prototype**. It includes mobile layout, daily KST task completion, ticket balance tracking, platform links, music-show reference cards, local task editing, install manifest and service worker.

## Run locally

From this directory run `python3 -m http.server 8080` and open `http://localhost:8080`. PWA installation on a public domain requires HTTPS.

## Deploy

Upload the entire directory to a static host (GitHub Pages, Netlify, Vercel). Use the host's HTTPS URL. On iOS use Safari > Share > Add to Home Screen; on Android use Chrome > Install / Add to Home Screen.

## Important limitations

- All data and edits are stored in each visitor's own browser via localStorage. **Admin changes are NOT shared across visitors.** No login or cloud backend exists yet.
- Sample tasks are illustrative only and **not verified live voting events**.
- Links currently open official platform homepages, not verified mobile deep links.
- App availability, scoring rules, dates and X verification requirements must be verified against official sources before publication.
- Do not store secrets in the frontend. To build shared administrator publishing, add Supabase Auth, role-based RLS, and tables for tasks, platforms and per-user completions.

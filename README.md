PagePalette

> PagePalette — a lightweight, visual notebook for capturing and iterating on color palettes, swatches, and design notes.

This repository contains the PagePalette application (web + mobile). The primary product is the PagePalette notebook: a focused UX for designers to create, annotate, and organize color studies.

Product highlights
- Capture palettes with names, tags, and notes
- Save swatches and export simple assets (SVG/PNG)
- Versioned palette history for iteration
- Designed for fast iteration and sharing with teammates

Quick notes for maintainers
- Web app entry: `apps/web`
- Mobile (Expo) entry: `apps/mobile`
- Use the integrated TanStack Query client for data fetching

Deployment
- Recommended: Vercel. Create a Vercel project and add the following repository secrets in GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- The repo contains a GitHub Actions workflow that builds and deploys to Vercel on every push to `main`.

Security checklist performed before push
- Scanned the repository for raw secrets and private keys (no raw secrets found).
- `.env` files are ignored by `.gitignore` and should not be committed.

If you want me to set up Vercel or DNS changes, grant access or provide the `VERCEL_TOKEN` and DNS provider instructions.


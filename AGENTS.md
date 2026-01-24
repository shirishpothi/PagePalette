# AGENTS

## Current Status: STATIC SITE

PagePalette has been liquidated. The repository now serves a static site via Vercel.

## Active Structure
- `apps/web/public/` - Static site (index.html + assets) deployed to Vercel
- `docs/` - Mirror for GitHub Pages
- `archive/apps/` - Archived React/Expo source code (no APIs)

## Commands
- No build commands needed - static HTML served directly
- To preview locally: `open apps/web/public/index.html` or use any static server

## Vercel Deployment
- Automatic deployment via `.github/workflows/vercel-deploy.yml` on push to `main`
- Domain: pagepalette.tech

## To Restore Full App (if needed)
1. Restore files from `archive/apps/` to `apps/`
2. Update vercel.json with framework config
3. Follow original AGENTS.md instructions preserved below

---

## Original Instructions (Archived)

- Follow repo rules in `.github/copilot-instructions.md`
- Monorepo: `apps/web` (React Router web) + `apps/mobile` (Expo Router)
- Web routing is file-based: create `page.jsx` folders
- Web commands (from `apps/web`): `npm run dev`, `npm run build`, `npm run start`, `npm run typecheck`
- Web tests: `npx vitest`
- Mobile commands (from `apps/mobile`): `npm install`, `npx expo start`
- Mobile tests: `npx jest`
- Code style: React/Expo functional components, hooks-first

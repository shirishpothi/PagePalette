# AGENTS

## Current Status: ARCHIVED / STATIC SITE

PagePalette has been liquidated. The repository now serves a static GitHub Pages site.

## Active Structure
- `docs/` - Static GitHub Pages site (index.html + assets)
- `archive/apps/` - Archived web and mobile source code

## Commands
- No build commands needed - static HTML served directly from `docs/`
- To preview locally: `open docs/index.html` or use any static server

## GitHub Pages Deployment
- Automatic deployment via `.github/workflows/pages.yml` on push to `main`
- Configure in repo Settings → Pages → Source: GitHub Actions

## To Restore Full App (if needed)
1. Move `archive/apps/` to root `apps/`
2. Uncomment triggers in `.github/workflows/vercel-deploy.yml`
3. Set `FEATURE_FULL_APP=true` environment variable
4. Follow original AGENTS.md instructions preserved below

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

# AGENTS

## Current Status: STATIC SITE WITH FEATURE FLAG

PagePalette has been liquidated. The repository serves a static site by default, with the full animated React app available behind a feature flag.

## Active Structure
- `apps/web/public/` - Static site (index.html + assets) deployed to Vercel
- `docs/` - Mirror for GitHub Pages
- `archive/apps/` - Archived React/Expo source code (ready for restoration)
- `build.sh` - Conditional build script controlled by DEPLOY_MODE
- `vercel.json` - Root Vercel configuration

## Deployment Modes

### Static Mode (Default)
- **DEPLOY_MODE=static** or unset
- Serves `apps/web/public/index.html` directly
- No build step required
- Fast deployment

### Full Mode (Feature Flag)
- **DEPLOY_MODE=full**
- Builds the full React Router app with animations
- Requires source code restored from `archive/apps/web/`

## Commands
- Test static build: `DEPLOY_MODE=static bash build.sh`
- Test full build: `DEPLOY_MODE=full bash build.sh`
- Preview locally: `open apps/web/public/index.html` or use any static server

## Vercel Deployment
- Automatic deployment via `.github/workflows/vercel-deploy.yml` on push to `main`
- Domain: pagepalette.tech
- Manual trigger allows selecting deployment mode (static/full)

## To Enable Full App Mode
1. Restore files from `archive/apps/web/` to `apps/web/`:
   - `src/` directory
   - `plugins/` directory
   - Config files (vite.config.ts, react-router.config.ts, tsconfig.json, tailwind.config.ts)
   - Merge package.json dependencies
2. Fix build dependencies (add `@remix-run/dev` to devDependencies)
3. Set `DEPLOY_MODE=full` in Vercel environment variables (or trigger manual workflow with "full" option)

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

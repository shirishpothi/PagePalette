# PagePalette — Company Legacy

> PagePalette was a student-run Junior Achievement company (2025/2026) that created customizable, eco-friendly notebooks.

**Status: Liquidated** — The company has successfully completed its JA journey. This repository now serves as a static legacy page hosted on GitHub Pages.

## Live Site

Visit the legacy page at: **https://shirishpothi.github.io/PagePalette/**

## Repository Structure

```
docs/           # Static GitHub Pages site (legacy page)
archive/        # Archived source code (web + mobile apps)
  └── apps/
      ├── web/      # React Router web app (archived)
      └── mobile/   # Expo mobile app (archived)
```

## Deployment

The static site is deployed automatically to GitHub Pages from the `docs/` folder on push to `main`.

### Setting up GitHub Pages

1. Go to **Settings → Pages** in your GitHub repository
2. Under **Source**, select **GitHub Actions**
3. The site will deploy automatically on the next push

### Redirecting from old domain

To redirect from your old Vercel/custom domain to GitHub Pages:

**Option A: DNS Redirect (if you control the domain)**
- Add a 301 redirect from your old domain to `https://shirishpothi.github.io/PagePalette/`

**Option B: Vercel Redirect (free)**
1. Keep your Vercel project but replace the app with a simple redirect:
   ```json
   // vercel.json
   {
     "redirects": [
       { "source": "/(.*)", "destination": "https://shirishpothi.github.io/PagePalette/$1", "permanent": true }
     ]
   }
   ```

**Option C: Custom domain on GitHub Pages**
1. Add a `CNAME` file to `docs/` with your custom domain
2. Configure DNS to point to GitHub Pages

## Archived Code

The original web and mobile applications are preserved in `archive/apps/`. To restore:

1. Move `archive/apps/` back to root level `apps/`
2. Uncomment the Vercel deploy workflow in `.github/workflows/vercel-deploy.yml`
3. Set up environment variables and secrets as documented in the original code

### Feature Flag

To re-enable the full application, set this environment variable:
```
FEATURE_FULL_APP=true
```

## Company Highlights

- **Revenue:** S$1,079
- **Notebooks Sold:** 54 units
- **Plastic Saved:** 26kg from landfills
- **Charity Donation:** S$225.25 to SHINE.sg
- **Shareholder Dividend:** 5% (S$17.50 total)

## Acknowledgments

Run by students of Nexus International School, advised by Mike Matthews & Michel Borst, guided by Jim Bevan.

---

*Junior Achievement Singapore 2025/2026*

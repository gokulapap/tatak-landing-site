# Tatak landing page

An immersive, scroll-driven landing page for Tatak — the multimodal journey planner for Bengaluru.

The page uses a restrained scroll world to move through Tatak's core story: door-to-door planning, BMTC and Namma Metro connections, truthful live-versus-estimated timing, and journey ranking.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm test
```

## Deploy to GitHub Pages

The repository includes a GitHub Actions workflow that builds a static export
and publishes it to GitHub Pages whenever `main` or `master` is pushed.

1. Make sure the GitHub remote is configured (it is already set in this checkout):

   ```bash
   git remote add origin git@github-personal:gokulapap/tatak-landing-site.git
   ```

   If `origin` already exists, verify it with `git remote -v` instead of adding
   it again.

2. Commit and push the site:

   ```bash
   git add .
   git commit -m "Add Tatak landing site"
   git push -u origin master
   ```

3. In the GitHub repository, open **Settings → Pages** and set **Source** to
   **GitHub Actions**. The `Deploy to GitHub Pages` workflow will run on the
   push; it can also be started manually from the **Actions** tab.

4. After the workflow succeeds, open:
   <https://gokulapap.github.io/tatak-landing-site/>

To verify the Pages build locally, run:

```bash
GITHUB_REPOSITORY=gokulapap/tatak-landing-site npm run build:pages
```

The site is built with Next.js, React, Vinext, and the canonical Tatak design tokens and bundled fonts.

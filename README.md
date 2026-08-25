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

2. Before the first deployment, open **Settings → Pages** in the GitHub
   repository and set **Source** to **GitHub Actions**. This enables the Pages
   site that the deployment workflow needs.

3. Commit and push the site:

   ```bash
   git add .
   git commit -m "Add Tatak landing site"
   git push -u origin master
   ```

   The `Deploy to GitHub Pages` workflow will run on the push; it can also be
   started manually from the **Actions** tab.

4. After the workflow succeeds, open:
   <https://gokulapap.github.io/tatak-landing-site/>

To verify the Pages build locally, run:

```bash
GITHUB_REPOSITORY=gokulapap/tatak-landing-site npm run build:pages
```

## Use the `tatak.tech` custom domain

The deployment reads the canonical URL and base path from GitHub Pages, so the
same workflow supports both the default repository URL and `tatak.tech`.

1. In personal GitHub **Settings → Pages**, add and verify `tatak.tech` using
   the TXT record that GitHub provides. Keep that TXT record after verification.
2. In this repository's **Settings → Pages**, enter `tatak.tech` under
   **Custom domain** and save it.
3. At the DNS provider for `tatak.tech`, add four `A` records for host `@`:

   ```text
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

4. Add a `CNAME` record for host `www` pointing to `gokulapap.github.io`.
   GitHub will redirect `www.tatak.tech` to `tatak.tech`.
5. Rerun **Deploy to GitHub Pages** from the repository's **Actions** tab.
6. After GitHub finishes its DNS check and certificate provisioning, enable
   **Enforce HTTPS** in the repository's Pages settings.

Because this repository deploys through GitHub Actions, a committed `CNAME`
file is not required.

The site is built with Next.js, React, Vinext, and the canonical Tatak design tokens and bundled fonts.

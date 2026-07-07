# Proguild Facility Management — website (CMS-managed)

Static site rendered from `data/*.json` by `scripts/build.js`, editable through the
shared JRD CMS at https://jrd-online-portfolio.vercel.app/admin.

- `data/pages.json` `team.json` `privacy.json` — content
- `data/theme.json` — design tokens → compiled to `assets/css/theme.css`
- `data/_schema.json` — describes editable sections/fields for the CMS
- `scripts/build.js` — renders data → `index.html`, `our-team.html`, `privacy-policy.html`; stamps `data-edit` for the visual editor
- `scripts/map.svg` — the coverage-map SVG (states colored at runtime from the editable COVERAGE config)
- `assets/js/main.js` — behaviors + the `?edit=1` visual-editor bridge

Build: `npm run build`. Deploy: Vercel builds on push (`vercel.json`). Images: Cloudinary `dlgc3fj6w` (folder `proguild/`).

Built by Jeffrey De La Nuez with Claude.

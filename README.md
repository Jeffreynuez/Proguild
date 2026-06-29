# Proguild Facility Management — website

Static marketing site for Proguild Facility Management (proguildfm.com).
Three self-contained pages, no build step and no dependencies:

- `index.html` — home (hero, services, interactive coverage map, team, contact)
- `our-team.html` — team
- `privacy-policy.html` — privacy policy

CSS, JavaScript, and the coverage-map SVG are inlined in each file. Images are
delivered through Cloudinary (cloud `dlgc3fj6w`); icons via the Lucide CDN.

## Deploy
Hosted on Vercel from this repo. `vercel.json` enables clean URLs
(`/our-team`, `/privacy-policy`). No build command — files are served as-is.

Built from a Claude Design system. A CMS-editable version (data JSON + a
`build.js` renderer, editable through the shared admin at
`jrd-online-portfolio.vercel.app/admin`) is the planned next phase.

Built by Jeffrey De La Nuez with Claude.

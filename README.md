# Portfolio

Static site. All content lives in `data/*.json`; edit those, not the HTML.

| File | Controls |
|---|---|
| profile.json | name, headline, contact, resume path, about, ticker |
| skills.json | skill groups |
| projects.json | projects (title, year, tags, links) |
| experience.json | timeline |
| education.json | degrees |
| certifications.json | certificates |

## Add a certification
1. Put the PDF in `assets/certs/`.
2. Add to `data/certifications.json`:
   `{ "title": "...", "issuer": "...", "year": "2026", "file": "assets/certs/name.pdf", "url": "" }`
   Use `url` instead of `file` for an external verify link.

## Resume
Resume is at `assets/Ananthu S.pdf`; replace the file to update.

## Run locally
`python -m http.server`, then open http://localhost:8000 (JSON won't load from file://).

## Deploy (GitHub Pages)
Push to a repo, then Settings > Pages > Deploy from branch > `main` / root.

# The Armont Residences

Landing page for The Armont Residences — a luxury 3-storey home development.

Built as a single, dependency-free `index.html` (HTML + CSS + a little vanilla JS). No build step.

## Features
- Sticky hero with a scroll-reveal (sections slide up over the pinned hero)
- Three-zone fixed navbar that hides on scroll-down / reveals on scroll-up
- Interactive image accordion (hover on desktop, auto-cycles on mobile/tablet)
- Two parallax techniques: `background-attachment: fixed` + a CSS scroll-driven (`animation-timeline: view()`) band
- WebP imagery for fast loads

## Run locally
Just open `index.html` in a browser, or serve the folder:
```bash
python3 -m http.server 8000
```

## Deploy
Static site — deploys on Netlify with no configuration (`netlify.toml` sets the publish dir to the repo root).

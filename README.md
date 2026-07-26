# Vishal Chanda — Research Console

An interactive, non-scrolling portfolio built as a single-viewport "instrument console" instead of a
traditional scrolling page. A left-hand rail of instrument modes swaps a central circular viewfinder
between six views, each using a visual metaphor drawn from the subject's own research:

| Mode | Metaphor | What it shows |
|---|---|---|
| **Overview** | Live network graph | Research domains orbiting a central node — hover to inspect each |
| **Profile** | Specimen slide | Bio, orbiting focus tags, clickable "lens" chips |
| **Publications** | Electrophoresis lanes | Research / review / book output as bands you click to inspect, with links to full-text PDFs |
| **Timeline** | Oscilloscope trace | A scrubbable signal trace through the research timeline |
| **Records** | Specimen tray | CV pages + academic / co-curricular / extra-curricular certificates |
| **Contact** | Data channels | GitHub, LinkedIn, Scopus, Google Scholar |

Press **`/`** anywhere to open the command palette and jump straight to a mode or a specific
publication. Press **1–6** to switch modes directly. Toggle light/dark with the moon icon.

## Structure

```
index.html            → app shell markup
style.css              → design tokens & layout (single stylesheet)
script.js               → all interactivity (vanilla JS, no build step)
data/
  publications.json    → research / review / book entries
  certificates.json     → certificate categories (academia / cocurricular / extracurricular)
assets/
  images/                → profile photo + certificate scans
  pdfs/                    → publication thumbnails & full-text PDFs
  resume/                   → CV page images
```

## Running locally

This site loads its data with `fetch()`, so it needs to be served over HTTP — opening
`index.html` directly from disk (`file://`) will fail to load the JSON data due to browser
CORS restrictions. Serve it locally with:

```
python -m http.server 8000
```

then visit `http://localhost:8000`.

## Publishing on GitHub Pages

```
1. Push all files to the main branch
2. Settings → Pages
3. Source: Deploy from a branch → Branch: main / (root)
```

No build step, no dependencies — it's plain HTML/CSS/JS.

## Adding content

- **New publication:** add an entry to `data/publications.json` under `research`, `review`, or
  `book`, then drop `<file>.jpg` (thumbnail) and `<file>.pdf` (full text) into
  `assets/pdfs/<category>/`. Also register the file name in the `PUB_ASSETS` map at the top of
  `script.js` so the console knows a thumbnail/PDF exists.
- **New certificate:** add an entry to the relevant category in `data/certificates.json` and
  drop the matching `<file>.jpg` into `assets/images/certificates/<category>/`.

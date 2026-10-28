# Pageforge

Turn a short brief into an editable landing page with a live 3D hero.
Pageforge runs entirely in your browser: no account, no server, no API key.

## What it does

- **Brief to blueprint.** Describe the page in a sentence. Pageforge picks a
  template, palette and 3D hero, and builds a structured page: hero,
  features, gallery, proof, call to action, FAQ and footer.
- **Edit everything.** Reorder, hide, add and remove sections; edit copy,
  links, colors, fonts, SEO fields and image slots. Every change is
  validated against a versioned schema.
- **Eight procedural 3D heroes**, all drawn in code and recolored by your
  theme: iridescent orb, orbiting rings, faceted crystal, liquid blob,
  signal wave, floating stack, double helix and constellation. The brief
  picks one (a skincare brief gets the blob, an analytics brief the wave);
  you can change it in the inspector.
- **Drafts and history.** Autosave, saved versions, restore, duplicate.
- **Preview links.** "Publish" makes a preview link that works in the same
  browser. It is not public hosting; see below.

Respects reduced-motion settings, pauses the 3D scene when it scrolls out
of view, and falls back to a CSS shape where WebGL is unavailable.

## Run it

Requires Node 20.19+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # unit tests
pnpm check      # type-check
pnpm build      # static site in dist/
```

## Host it for free

`pnpm build` produces a plain static folder (`dist/`) with relative paths
and hash-based routes, so it runs from any static host or subfolder with no
rewrite rules: GitHub Pages, Netlify, Cloudflare Pages, or opening it from a
local web server.

## Where your data lives

Projects, revisions and publish state are stored in your browser's local
storage. Clearing site data removes them, and preview links only open in
the browser that made them. Nothing is sent anywhere.

## Project layout

| Path | What it is |
|---|---|
| `client/src/lib/blueprint.ts` | Page schema (zod), versioning and migration |
| `client/src/lib/generator.ts` | Brief to blueprint: template, scene and section choice |
| `client/src/lib/scenes.ts` | The procedural 3D scenes |
| `client/src/lib/projectStore.ts` | Local drafts, revisions and publish state |
| `client/src/components/ThreeHero.tsx` | Renders a scene with three.js |
| `client/src/components/PagePreview.tsx` | Renders a blueprint as a page |

### Adding a 3D scene

1. Add an id and label to `SCENE_IDS` / `SCENE_LABELS` in `blueprint.ts`.
2. Write a builder in `scenes.ts` that returns `{ root, update(t) }` and add
   it to `buildScene`.
3. Optionally map brief keywords to it in `SCENE_HINTS` in `generator.ts`.

`scenes.test.ts` checks every scene builds, animates without NaN, is
deterministic and frees its GPU resources.

## Origin

The page-specification model (typed sections, template and design metadata,
schema versioning, drafts and publish states) was adapted from
`qreatestudiosv1`; see [docs/spec-phase-extraction.md](docs/spec-phase-extraction.md).

## License

MIT

# Pageforge

Pageforge turns short landing-page briefs into structured, editable page blueprints and previews them as responsive landing pages with procedural Three.js hero art. It salvages the typed-section and template logic from `qreatestudiosv1` without depending on GrapesJS.

## Run and build

- `pnpm dev:static` runs the initialized Preview server on its configured `PORT` (default 3000).
- `pnpm build:static` builds the static website into `dist/public/`.
- `pnpm check` runs TypeScript diagnostics.
- `pnpm test` runs the project test command.

## Product behavior

The generator uses deterministic in-browser prompt interpretation to choose a template/category and create a versioned blueprint. The editor supports title/slug/description/locale/SEO metadata; editable, ordered, visible typed sections; color and font tokens; image-slot references; validation and schema migration; browser-local draft autosave, saved revisions, restore, reopen, and duplication. The Three.js hero responds to blueprint content and theme edits, and the canvas can switch desktop/tablet/mobile widths.

Managed database, server, LLM, and media-storage features were not enabled. Drafts, revisions, and publish state are therefore held in the browser’s local storage. “Publish” generates a local preview route that only resolves in the same browser profile; it does **not** deploy a page to the public internet. Configure a public hosting/storage path before presenting these links as public landing-page URLs.

See [`docs/spec-phase-extraction.md`](docs/spec-phase-extraction.md) for the source-repository logic and the Pageforge mapping.

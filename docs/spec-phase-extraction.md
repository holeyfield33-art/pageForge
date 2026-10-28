# Salvaged page-specification logic from qreatestudiosv1

Reviewed source: `https://github.com/holeyfield33-art/qreatestudiosv1` (`main`).

The public repository does not contain a module named “Blueprint” or “spec phase.” The reusable specification logic is distributed across the landing-page creation flow, template definitions, Puck editor configuration, GrapesJS editor adapter, API routes, Prisma model, and page schema.

## Source logic

### Start from a template

`app/dashboard/landing-pages/create/page.tsx` loads the available templates, derives category filters, accepts a preselected template ID/name/category, and blocks premium templates when the current plan lacks access. Selecting a template initializes the page title and URL slug, then continues to the create step. Slugs are lowercased, punctuation/spacing is normalized to hyphens, and the result is capped at 50 characters. Creation seeds the page with the template’s default section data and design metadata. An optional QR-code ID links the newly created page to that QR code; this is part of the original product, not the salvaged spec workflow.

### Describe a page as structured data

`lib/schemas/page.ts` defines the page document. It has a `schemaVersion`, metadata, an ordered `content` list, and optional root properties. Metadata includes a required title and slug, optional description, SEO metadata, status (`draft`, `published`, or `archived`), optional publication timestamp, and locale defaulting to `en-US`. Slugs must contain lowercase letters, numbers, and hyphens. SEO title and description limits are 60 and 160 characters. A section carries a UUID, type, integer order, visible flag, and a props record. The color scheme uses validated six-digit hex colors. The schema also defines image metadata, reusable template metadata, a Puck data format (`content`, `root`, optional `zones`), and a `1.0.0` → `1.1.0` page-schema migration that adds locale when absent.

### Carry template design intent

`lib/templates/puck-templates.ts` supplies complete templates as typed Puck section arrays plus design metadata. The metadata includes five color tokens (primary, secondary, accent, background, text), optional heading/body font choices, and image slots that can be replaced. The templates use section-specific props instead of raw page HTML as the primary content model.

### Define editable section contracts

`lib/puckConfig.tsx` declares editor fields, labels, field types, choices, default props, and renderers for the sections. The source includes hero content and CTA settings, a feature array with icon/title/description, menu display modes, QR-code content, gallery image arrays, contact content, and other reusable landing-page components. This is the most direct blueprint for a spec-first editor: section type + validated/editable properties + rendering behavior.

### Save drafts and publish

`app/api/landing-pages/route.ts` creates a page as unpublished and saves both content and `draftContent`, along with the chosen template and metadata. It validates the slug and checks template availability/premium access. `app/api/landing-pages/[id]/route.ts` reads the page and related template/menu/QR context, applies owner/organization access checks, accepts content/metadata/SEO updates, records `publishedAt` on the transition to published, and deletes pages. Its draft adapter accepts either GrapesJS `{html, css, json, timestamp}` or Puck `{content, root, zones}` data. The database model retains draft and published content separately.

### GrapesJS-specific editing behavior to avoid

`components/builder/GrapesJSEditor.tsx` lazy-loads the editor, initializes block/layer/trait/style panels, seeds either project JSON or HTML/CSS, and emits debounced changes after component or style changes. It registers image/text component behaviors and keyboard shortcuts for delete, undo/redo, and duplicate. These are editor mechanics rather than the underlying page specification. Pageforge does not use GrapesJS or preserve its HTML/CSS/JSON editor state.

## Pageforge mapping

Pageforge keeps the reusable concepts—template/category choice, metadata and SEO, ordered typed sections, per-section properties and visibility, color/font/image-slot design metadata, schema validation/versioning, draft/revision history, and publish-state transitions. It uses a Puck-style structured blueprint and a procedural Three.js hero renderer. Prompt interpretation is deterministic and local, with no LLM call. Drafts and revisions are stored in browser local storage, with no server. “Publish” creates a browser-local preview route; it is explicitly not represented as public hosting. The original QR connection, accounts, organizations, billing, CRM, print services, analytics, and server-side tenant rules are outside this focused product.

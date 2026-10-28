# Pageforge — TODO

## Prompt-to-blueprint generation
- [x] A user can enter a landing-page brief and generate an initial page blueprint and composition through the prompt flow.
- [x] The generator can create valid structured section data without relying on GrapesJS.
- [x] Preserve the approved scope: the LLM power-up was not selected, so generation does not call an LLM; it uses an in-browser deterministic prompt-to-blueprint flow instead.

## Templates and structured page editor
- [x] Users can choose a template and category suited to different landing-page goals.
- [x] The page metadata editor includes title, slug, description, locale, and SEO fields.
- [x] The section editor represents sections as ordered, typed items with schema-defined editable properties, and supports adding, removing, reordering, and changing visibility.
- [x] Template design metadata includes color palettes, font choices, and replaceable image slots.
- [x] The salvaged page-specification model supports page metadata, ordered sections and properties, section visibility, template metadata, draft content, and publish-state concepts.

## 3D preview and responsive composition
- [x] The interactive 3D page preview reflects blueprint and content edits in real time.
- [x] The preview can switch responsive viewport sizes so the generated landing page can be inspected across device widths.

## Blueprint validation and project drafts
- [x] The blueprint uses a versioned schema with validation and migration support, and presents invalid specifications clearly.
- [x] Users can save draft projects, reopen them, duplicate them, and edit revisions without losing their latest state.
- [x] The Database persistence power-up was not selected; project drafts and revisions persist locally in the browser rather than in managed database storage.
- [x] The managed media-library power-up was not selected; no upload/storage service was added. Template image slots accept configured references.

## Preview and publishing state
- [x] The product provides a preview state, publish/unpublish concepts, and generated browser-local preview URLs.
- [x] Publish-state changes and available share actions are clearly distinguished from true public hosting; Pageforge does not imply a hosted page exists when it only records local state.

## Repository scope
- [x] Reuse the relevant concepts from the public qreatestudiosv1 repository's page-specification workflow: template/category selection, metadata (title, slug, description, locale, SEO), ordered typed sections with editable properties and visibility, color/font/image-slot metadata, schema validation/versioning, draft persistence, and publish workflow concepts.
- [x] Do not depend on GrapesJS. Do not bring in the source repository's unrelated QR management, QR analytics, print ordering, CRM, billing, organizations, or account system.

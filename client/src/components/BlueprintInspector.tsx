import { useState } from "react";
import { Eye, EyeOff, FileText, Palette, Settings2 } from "lucide-react";
import type { PageBlueprint, Section } from "@/lib/blueprint";

type Props = {
  blueprint: PageBlueprint;
  selectedSection?: Section;
  onUpdateSection: (section: Section) => void;
  onUpdateMeta: (meta: PageBlueprint["meta"]) => void;
  onUpdateImageSlots: (slots: PageBlueprint["imageSlots"]) => void;
  onUpdateTheme: (theme: PageBlueprint["theme"]) => void;
};

type Tab = "section" | "page" | "theme";

function Field({ label, value, onChange, multiline = false, maxLength }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; maxLength?: number }) {
  return (
    <label className="inspector-field">
      <span className="inspector-field__label">{label}{maxLength ? <small>{value.length}/{maxLength}</small> : null}</span>
      {multiline
        ? <textarea value={value} maxLength={maxLength} rows={3} onChange={(event) => onChange(event.target.value)} />
        : <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-field"><span>{label}</span><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><code>{value.toUpperCase()}</code></label>;
}

export default function BlueprintInspector({ blueprint, selectedSection, onUpdateSection, onUpdateMeta, onUpdateImageSlots, onUpdateTheme }: Props) {
  const [tab, setTab] = useState<Tab>("section");
  const updateProps = (patch: Record<string, unknown>) => {
    if (!selectedSection) return;
    onUpdateSection({ ...selectedSection, props: { ...selectedSection.props, ...patch } } as Section);
  };

  return (
    <aside className="inspector-panel">
      <div className="inspector-heading"><div><span className="panel-eyebrow">BLUEPRINT</span><h2>Inspector</h2></div><button type="button" className="icon-button" aria-label="Inspector settings"><Settings2 size={16} /></button></div>
      <div className="inspector-tabs" role="tablist" aria-label="Blueprint inspector">
        <button type="button" role="tab" aria-selected={tab === "section"} className={tab === "section" ? "is-active" : ""} onClick={() => setTab("section")}><Settings2 size={14} />Section</button>
        <button type="button" role="tab" aria-selected={tab === "page"} className={tab === "page" ? "is-active" : ""} onClick={() => setTab("page")}><FileText size={14} />Page</button>
        <button type="button" role="tab" aria-selected={tab === "theme"} className={tab === "theme" ? "is-active" : ""} onClick={() => setTab("theme")}><Palette size={14} />Style</button>
      </div>
      <div className="inspector-content">
        {tab === "section" && (
          selectedSection ? <>
            <div className="inspector-section-title"><div className="section-type-icon">{selectedSection.label.slice(0, 1)}</div><div><strong>{selectedSection.label}</strong><span>{selectedSection.type} section</span></div><span className={`visibility-pill ${selectedSection.visible ? "" : "is-hidden"}`}>{selectedSection.visible ? <Eye size={12} /> : <EyeOff size={12} />}{selectedSection.visible ? "Visible" : "Hidden"}</span></div>
            {selectedSection.type === "hero" && <>
              <Field label="Eyebrow" value={selectedSection.props.eyebrow} maxLength={80} onChange={(value) => updateProps({ eyebrow: value })} />
              <Field label="Headline" value={selectedSection.props.headline} maxLength={120} onChange={(value) => updateProps({ headline: value })} />
              <Field label="Subheadline" value={selectedSection.props.subheadline} maxLength={240} multiline onChange={(value) => updateProps({ subheadline: value })} />
              <Field label="Button label" value={selectedSection.props.ctaLabel} maxLength={48} onChange={(value) => updateProps({ ctaLabel: value })} />
              <Field label="Button link" value={selectedSection.props.ctaHref} maxLength={240} onChange={(value) => updateProps({ ctaHref: value })} />
              <label className="inspector-field"><span className="inspector-field__label">3D hero form</span><select value={selectedSection.props.scene} onChange={(event) => updateProps({ scene: event.target.value })}><option value="orb">Iridescent orb</option><option value="rings">Orbiting rings</option><option value="crystal">Faceted crystal</option></select></label>
            </>}
            {selectedSection.type === "features" && <>
              <Field label="Heading" value={selectedSection.props.heading} maxLength={120} onChange={(value) => updateProps({ heading: value })} />
              <Field label="Intro" value={selectedSection.props.intro} maxLength={240} multiline onChange={(value) => updateProps({ intro: value })} />
              <div className="inspector-subhead">Feature cards <small>{selectedSection.props.items.length}/6</small></div>
              {selectedSection.props.items.map((item, index) => <div className="repeat-fields" key={item.id}><div className="repeat-fields__top">FEATURE 0{index + 1}</div><Field label="Title" value={item.title} maxLength={80} onChange={(value) => updateProps({ items: selectedSection.props.items.map((current) => current.id === item.id ? { ...current, title: value } : current) })} /><Field label="Description" value={item.description} maxLength={180} multiline onChange={(value) => updateProps({ items: selectedSection.props.items.map((current) => current.id === item.id ? { ...current, description: value } : current) })} /></div>)}
              {selectedSection.props.items.length < 6 && <button className="text-action" type="button" onClick={() => updateProps({ items: [...selectedSection.props.items, { id: `${Date.now()}`, title: "New feature", description: "Add a short benefit." }] })}>+ Add feature</button>}
            </>}
            {selectedSection.type === "gallery" && <>
              <Field label="Heading" value={selectedSection.props.heading} maxLength={120} onChange={(value) => updateProps({ heading: value })} />
              <Field label="Intro" value={selectedSection.props.intro} maxLength={220} multiline onChange={(value) => updateProps({ intro: value })} />
              <div className="inspector-subhead">Gallery cards</div>
              {selectedSection.props.items.map((item, index) => <div className="repeat-fields" key={item.id}><div className="repeat-fields__top">CARD 0{index + 1}</div><Field label="Title" value={item.title} maxLength={80} onChange={(value) => updateProps({ items: selectedSection.props.items.map((current) => current.id === item.id ? { ...current, title: value } : current) })} /><Field label="Caption" value={item.note} maxLength={100} onChange={(value) => updateProps({ items: selectedSection.props.items.map((current) => current.id === item.id ? { ...current, note: value } : current) })} /><ColorField label="Card color" value={item.color} onChange={(value) => updateProps({ items: selectedSection.props.items.map((current) => current.id === item.id ? { ...current, color: value } : current) })} /></div>)}
            </>}
            {selectedSection.type === "proof" && <>
              <Field label="Section heading" value={selectedSection.props.heading} maxLength={120} onChange={(value) => updateProps({ heading: value })} />
              <Field label="Quote" value={selectedSection.props.quote} maxLength={280} multiline onChange={(value) => updateProps({ quote: value })} />
              <Field label="Person" value={selectedSection.props.author} maxLength={80} onChange={(value) => updateProps({ author: value })} />
              <Field label="Role / company" value={selectedSection.props.role} maxLength={100} onChange={(value) => updateProps({ role: value })} />
            </>}
            {selectedSection.type === "cta" && <>
              <Field label="Heading" value={selectedSection.props.heading} maxLength={120} onChange={(value) => updateProps({ heading: value })} />
              <Field label="Supporting copy" value={selectedSection.props.body} maxLength={220} multiline onChange={(value) => updateProps({ body: value })} />
              <Field label="Button label" value={selectedSection.props.ctaLabel} maxLength={48} onChange={(value) => updateProps({ ctaLabel: value })} />
              <Field label="Button link" value={selectedSection.props.ctaHref} maxLength={240} onChange={(value) => updateProps({ ctaHref: value })} />
            </>}
            {selectedSection.type === "faq" && <>
              <Field label="Heading" value={selectedSection.props.heading} maxLength={120} onChange={(value) => updateProps({ heading: value })} />
              {selectedSection.props.items.map((item, index) => <div className="repeat-fields" key={item.id}><div className="repeat-fields__top">QUESTION 0{index + 1}</div><Field label="Question" value={item.question} maxLength={140} onChange={(value) => updateProps({ items: selectedSection.props.items.map((current) => current.id === item.id ? { ...current, question: value } : current) })} /><Field label="Answer" value={item.answer} maxLength={260} multiline onChange={(value) => updateProps({ items: selectedSection.props.items.map((current) => current.id === item.id ? { ...current, answer: value } : current) })} /></div>)}
            </>}
            {selectedSection.type === "footer" && <>
              <Field label="Brand name" value={selectedSection.props.brand} maxLength={80} onChange={(value) => updateProps({ brand: value })} />
              <Field label="Footer note" value={selectedSection.props.note} maxLength={180} multiline onChange={(value) => updateProps({ note: value })} />
              <Field label="Contact email" value={selectedSection.props.email} maxLength={120} onChange={(value) => updateProps({ email: value })} />
            </>}
            <div className="inspector-tip"><span>↳</span> Edits update the live page instantly. Drafts stay in this browser.</div>
          </> : <div className="inspector-empty"><Settings2 size={20} /><strong>Select a section</strong><span>Choose any layer to edit its content and behavior.</span></div>
        )}
        {tab === "page" && <>
          <div className="inspector-section-title"><div className="section-type-icon"><FileText size={15} /></div><div><strong>Page details</strong><span>Metadata and search preview</span></div></div>
          <Field label="Page title" value={blueprint.meta.title} maxLength={100} onChange={(value) => onUpdateMeta({ ...blueprint.meta, title: value })} />
          <Field label="Slug" value={blueprint.meta.slug} maxLength={48} onChange={(value) => onUpdateMeta({ ...blueprint.meta, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
          <Field label="Description" value={blueprint.meta.description} maxLength={500} multiline onChange={(value) => onUpdateMeta({ ...blueprint.meta, description: value })} />
          <Field label="Locale" value={blueprint.meta.locale} maxLength={20} onChange={(value) => onUpdateMeta({ ...blueprint.meta, locale: value })} />
          <div className="inspector-subhead">SEO preview</div>
          <Field label="Meta title" value={blueprint.meta.seo.metaTitle} maxLength={60} onChange={(value) => onUpdateMeta({ ...blueprint.meta, seo: { ...blueprint.meta.seo, metaTitle: value } })} />
          <Field label="Meta description" value={blueprint.meta.seo.metaDescription} maxLength={160} multiline onChange={(value) => onUpdateMeta({ ...blueprint.meta, seo: { ...blueprint.meta.seo, metaDescription: value } })} />
          <Field label="Keywords (comma separated)" value={blueprint.meta.seo.keywords.join(", ")} onChange={(value) => onUpdateMeta({ ...blueprint.meta, seo: { ...blueprint.meta.seo, keywords: value.split(",").map((word) => word.trim()).filter(Boolean).slice(0, 12) } })} />
          <Field label="Canonical URL" value={blueprint.meta.seo.canonicalUrl} maxLength={300} onChange={(value) => onUpdateMeta({ ...blueprint.meta, seo: { ...blueprint.meta.seo, canonicalUrl: value } })} />
          <div className="inspector-subhead">Replaceable media slots</div>
          <Field label="Hero media reference" value={blueprint.imageSlots.hero ?? ""} onChange={(value) => onUpdateImageSlots({ ...blueprint.imageSlots, hero: value })} />
          <Field label="Feature media reference" value={blueprint.imageSlots.feature ?? ""} onChange={(value) => onUpdateImageSlots({ ...blueprint.imageSlots, feature: value })} />
          <div className="inspector-tip"><span>↳</span> These are blueprint references only; media uploads are not connected in this workspace.</div>
        </>}
        {tab === "theme" && <>
          <div className="inspector-section-title"><div className="section-type-icon"><Palette size={15} /></div><div><strong>Design system</strong><span>Palette and typography tokens</span></div></div>
          <div className="theme-swatches"><span style={{ background: blueprint.theme.primary }} /><span style={{ background: blueprint.theme.secondary }} /><span style={{ background: blueprint.theme.accent }} /><span style={{ background: blueprint.theme.background }} /><span style={{ background: blueprint.theme.surface }} /></div>
          <ColorField label="Primary" value={blueprint.theme.primary} onChange={(value) => onUpdateTheme({ ...blueprint.theme, primary: value })} />
          <ColorField label="Secondary" value={blueprint.theme.secondary} onChange={(value) => onUpdateTheme({ ...blueprint.theme, secondary: value })} />
          <ColorField label="Accent" value={blueprint.theme.accent} onChange={(value) => onUpdateTheme({ ...blueprint.theme, accent: value })} />
          <ColorField label="Page background" value={blueprint.theme.background} onChange={(value) => onUpdateTheme({ ...blueprint.theme, background: value })} />
          <ColorField label="Surface" value={blueprint.theme.surface} onChange={(value) => onUpdateTheme({ ...blueprint.theme, surface: value })} />
          <ColorField label="Text" value={blueprint.theme.text} onChange={(value) => onUpdateTheme({ ...blueprint.theme, text: value })} />
          <label className="inspector-field"><span className="inspector-field__label">Heading font</span><select value={blueprint.theme.headingFont} onChange={(event) => onUpdateTheme({ ...blueprint.theme, headingFont: event.target.value })}><option>Space Grotesk</option><option>DM Sans</option><option>Playfair Display</option><option>Manrope</option></select></label>
          <label className="inspector-field"><span className="inspector-field__label">Body font</span><select value={blueprint.theme.bodyFont} onChange={(event) => onUpdateTheme({ ...blueprint.theme, bodyFont: event.target.value })}><option>DM Sans</option><option>Space Grotesk</option><option>Inter</option><option>Manrope</option></select></label>
          <div className="inspector-tip"><span>↳</span> Five palette tokens flow through every section and the 3D material.</div>
        </>}
      </div>
    </aside>
  );
}

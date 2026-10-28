import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, Copy, Eye, EyeOff, ExternalLink, FilePlus2, Globe2, History, Layers3, LayoutTemplate, LoaderCircle, Menu, Monitor, PanelRightClose, Plus, Save, Search, Sparkles, Smartphone, Tablet, Trash2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import BlueprintInspector from "@/components/BlueprintInspector";
import PagePreview from "@/components/PagePreview";
import { BlueprintSchema, validateBlueprint, type PageBlueprint, type Section, type SectionType } from "@/lib/blueprint";
import { createSection, generateBlueprint, TEMPLATE_OPTIONS } from "@/lib/generator";
import { createProject, duplicateProject, listProjects, saveRevision, setPublished, updateDraft, type LocalProject } from "@/lib/projectStore";

const SEED_PROMPT = "A landing page for a design-forward skincare brand with a dreamy 3D hero, product highlights, and a simple signup path.";

type Viewport = "desktop" | "tablet" | "mobile";

function formatSaved(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Just now";
  return `Edited ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function getActiveProjectId(): string | null {
  try { return window.localStorage.getItem("pageforge.active-project"); } catch { return null; }
}

function rememberActiveProject(id: string) {
  try { window.localStorage.setItem("pageforge.active-project", id); } catch { /* Keep the active project in memory. */ }
}

export default function Home() {
  const [project, setProject] = useState<LocalProject | null>(null);
  const [blueprint, setBlueprint] = useState<PageBlueprint | null>(null);
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [prompt, setPrompt] = useState(SEED_PROMPT);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [preferredTemplate, setPreferredTemplate] = useState("");
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const existing = listProjects();
    setProjects(existing);
    let selected = existing.find((item) => item.id === getActiveProjectId());
    if (!selected) selected = existing[0];
    if (!selected) {
      selected = createProject(generateBlueprint(SEED_PROMPT));
    }
    setProject(selected);
    setBlueprint(selected.blueprint);
    setActiveSectionId(selected.blueprint.sections.find((section) => section.type === "hero")?.id ?? selected.blueprint.sections[0]?.id ?? "");
    setPrompt(selected.blueprint.meta.description || SEED_PROMPT);
    rememberActiveProject(selected.id);
    setProjects(listProjects());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !project || !blueprint) return;
    const updated = updateDraft(project.id, blueprint);
    if (updated) setProject((current) => current?.id === updated.id ? { ...current, name: updated.name, updatedAt: updated.updatedAt } : current);
    setProjects(listProjects());
  }, [blueprint, project?.id, ready]);

  const selectedSection = blueprint?.sections.find((section) => section.id === activeSectionId);
  const validation = useMemo(() => blueprint ? validateBlueprint(blueprint) : null, [blueprint]);
  const pageIsValid = Boolean(validation?.success);
  const currentSlug = blueprint?.meta.slug || "untitled-page";
  const publishUrl = project && typeof window !== "undefined"
    ? `${window.location.origin}/p/${encodeURIComponent(currentSlug)}?project=${encodeURIComponent(project.id)}`
    : "";
  const filteredProjects = projects.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  function activate(next: LocalProject) {
    setProject(next);
    setBlueprint(next.blueprint);
    setActiveSectionId(next.blueprint.sections.find((section) => section.type === "hero")?.id ?? next.blueprint.sections[0]?.id ?? "");
    setPrompt(next.blueprint.meta.description || SEED_PROMPT);
    rememberActiveProject(next.id);
    setShowBrief(false);
    setShowInspector(false);
  }

  function startGeneratedProject(templateId?: string) {
    const text = prompt.trim() || SEED_PROMPT;
    setGenerating(true);
    window.setTimeout(() => {
      const next = createProject(generateBlueprint(text, templateId || preferredTemplate || undefined));
      activate(next);
      setPreferredTemplate("");
      setProjects(listProjects());
      setGenerating(false);
      toast.success("Blueprint created", { description: "Your brief is now a structured, editable page." });
    }, 260);
  }

  function saveCurrentRevision() {
    if (!project || !blueprint) return;
    const parsed = BlueprintSchema.safeParse(blueprint);
    if (!parsed.success) {
      toast.error("Fix blueprint issues before saving", { description: parsed.error.issues[0]?.message || "Review the fields marked in the inspector." });
      setShowInspector(true);
      return;
    }
    const saved = saveRevision(project.id, parsed.data);
    if (saved) {
      setProject(saved);
      setProjects(listProjects());
      toast.success(`Draft saved as v${saved.version}`);
    }
  }

  function restoreRevision(snapshot: PageBlueprint, version: number) {
    const restored = { ...structuredClone(snapshot), status: "draft" as const };
    const saved = project ? saveRevision(project.id, restored) : undefined;
    setBlueprint(saved?.blueprint ?? restored);
    if (saved) {
      setProject(saved);
      setProjects(listProjects());
    }
    setActiveSectionId(restored.sections.find((section) => section.type === "hero")?.id ?? restored.sections[0]?.id ?? "");
    setHistoryOpen(false);
    toast.success(saved ? `Restored v${version} as v${saved.version}` : `Restored v${version} in the editor`, { description: "The older snapshots remain available in history." });
  }

  function duplicateCurrent() {
    if (!project) return;
    const copy = duplicateProject(project.id);
    if (!copy) return;
    activate(copy);
    setProjects(listProjects());
    toast.success("Project duplicated");
  }

  function togglePublish() {
    if (!project || !blueprint) return;
    if (!BlueprintSchema.safeParse(blueprint).success) {
      toast.error("Resolve blueprint issues before publishing");
      setShowInspector(true);
      return;
    }
    const wasPublished = blueprint.status === "published";
    const saved = setPublished(project.id, blueprint);
    if (!saved) return;
    setProject(saved);
    setBlueprint(saved.blueprint);
    setProjects(listProjects());
    if (!wasPublished) {
      setShareOpen(true);
      toast.success("Local preview link is ready", { description: "This link opens in this browser’s Pageforge workspace." });
    } else {
      setShareOpen(false);
      toast.success("Page moved back to draft");
    }
  }

  async function copyPublishUrl() {
    if (!publishUrl) return;
    try {
      await navigator.clipboard.writeText(publishUrl);
      toast.success("Local preview link copied");
    } catch {
      toast.error("Clipboard access is unavailable", { description: publishUrl });
    }
  }

  function updateSection(next: Section) {
    setBlueprint((current) => current ? { ...current, sections: current.sections.map((section) => section.id === next.id ? next : section) } : current);
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    setBlueprint((current) => {
      if (!current) return current;
      const from = current.sections.findIndex((section) => section.id === sectionId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.sections.length) return current;
      const sections = [...current.sections];
      [sections[from], sections[to]] = [sections[to], sections[from]];
      return { ...current, sections };
    });
  }

  function toggleVisibility(sectionId: string) {
    setBlueprint((current) => current ? {
      ...current,
      sections: current.sections.map((section) => section.id === sectionId ? { ...section, visible: !section.visible } as Section : section),
    } : current);
  }

  function removeSection(sectionId: string) {
    if (!blueprint || blueprint.sections.length <= 1) {
      toast.error("A blueprint needs at least one section");
      return;
    }
    const nextSections = blueprint.sections.filter((section) => section.id !== sectionId);
    setBlueprint({ ...blueprint, sections: nextSections });
    if (activeSectionId === sectionId) setActiveSectionId(nextSections[0].id);
  }

  function addSection(type: SectionType) {
    if (!blueprint || blueprint.sections.length >= 24) {
      toast.error("This blueprint has reached the 24-section limit");
      return;
    }
    const section = createSection(type, blueprint.theme);
    setBlueprint({ ...blueprint, sections: [...blueprint.sections, section] });
    setActiveSectionId(section.id);
    setShowInspector(true);
  }

  if (!ready || !project || !blueprint) {
    return <div className="boot-screen"><div className="boot-mark">P</div><span>Preparing your studio…</span><LoaderCircle size={16} className="spin" /></div>;
  }

  return (
    <div className="studio-shell">
      <header className="topbar">
        <button type="button" className="mobile-menu-button" aria-label="Open project panel" onClick={() => setShowBrief((value) => !value)}><Menu size={19} /></button>
        <a className="brand-lockup" href="/" aria-label="Pageforge home"><span className="brand-glyph">P</span><span className="brand-name">pageforge<span className="brand-period">.</span></span><span className="brand-divider" /><span className="brand-workspace">STUDIO</span></a>
        <div className="topbar-breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{project.name}</strong><ChevronDown size={13} /></div>
        <div className="topbar-actions">
          <span className="save-indicator"><span className="save-indicator__dot" />Saved locally</span>
          <button type="button" className="button button--quiet topbar-duplicate" onClick={duplicateCurrent}><Copy size={14} />Duplicate</button>
          <button type="button" className="button button--quiet topbar-save" onClick={saveCurrentRevision}><Save size={14} />Save draft <kbd>⌘ S</kbd></button>
          <button type="button" className={`button ${blueprint.status === "published" ? "button--published" : "button--primary"}`} onClick={togglePublish}><Globe2 size={15} />{blueprint.status === "published" ? "Unpublish" : "Publish"}</button>
          <button type="button" className="mobile-inspector-button" aria-label="Open inspector" onClick={() => setShowInspector((value) => !value)}><PanelRightClose size={18} /></button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className={`brief-panel ${showBrief ? "brief-panel--open" : ""}`}>
          <div className="brief-panel__top"><div className="workspace-label"><span className="workspace-label__mark">PF</span><div><strong>Pageforge Lab</strong><span>Personal workspace</span></div></div><span className="workspace-menu">···</span></div>
          <div className="brief-scroll">
            <div className="brief-intro"><span className="panel-eyebrow">THE SPEC STUDIO</span><h1>Give an idea<br />a <em>shape.</em></h1><p>Describe the page. Pageforge turns it into a clean, editable blueprint.</p></div>
            <div className="prompt-card">
              <div className="prompt-card__top"><span><Sparkles size={13} /> YOUR BRIEF</span><span className="prompt-card__mode">LOCAL SPEC ENGINE</span></div>
              <textarea aria-label="Describe your landing page" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="A quiet skincare brand with an immersive 3D product hero…" maxLength={500} />
              <div className="prompt-card__footer"><span>{prompt.length}/500</span><button type="button" className="generate-button" disabled={generating || !prompt.trim()} onClick={() => startGeneratedProject()}>{generating ? <LoaderCircle size={15} className="spin" /> : <WandSparkles size={15} />}{generating ? "Shaping…" : "Generate blueprint"}</button></div>
            </div>
            <div className="prompt-examples"><span className="micro-label">TRY A STARTER</span><div className="starter-chips"><button type="button" onClick={() => setPrompt("A modern SaaS launch page for a product analytics startup with a clear demo signup.")}>SaaS launch</button><button type="button" onClick={() => setPrompt("A sculptural product landing page for an independent skincare brand with a 3D hero and editorial gallery.")}>Product story</button><button type="button" onClick={() => setPrompt("A warm, contemporary landing page for a neighborhood café with a menu and reservation CTA.")}>Local business</button></div></div>

            <div className="sidebar-section sidebar-section--templates">
              <div className="sidebar-section__heading"><div><span className="micro-label">STARTING POINT</span><h2>Templates</h2></div><button type="button" className="plain-icon" aria-label="Show all templates"><LayoutTemplate size={15} /></button></div>
              <div className="template-list">{TEMPLATE_OPTIONS.map((template, index) => <button type="button" className="template-row" key={template.id} onClick={() => { setPreferredTemplate(template.id); setPrompt(`${template.description} Brief: ${prompt.trim() || "make it distinctive and easy to explore"}`); }}><span className={`template-preview template-preview--${index + 1}`}><i /><b /><em /></span><span className="template-row__info"><strong>{template.name}</strong><small>{template.category} · {template.marker}</small></span><span className="template-row__arrow">↗</span></button>)}</div>
            </div>

            <div className="sidebar-section sidebar-section--sections">
              <div className="sidebar-section__heading"><div><span className="micro-label">CONTENT STRUCTURE</span><h2>Page sections <span>{blueprint.sections.length}</span></h2></div><label className="add-section-select"><Plus size={15} /><select aria-label="Add section" value="" onChange={(event) => { if (event.target.value) addSection(event.target.value as SectionType); }}><option value="" disabled>Add</option><option value="hero">Hero</option><option value="features">Features</option><option value="gallery">Gallery</option><option value="proof">Social proof</option><option value="cta">Call to action</option><option value="faq">FAQ</option><option value="footer">Footer</option></select></label></div>
              <div className="section-list">{blueprint.sections.map((section, index) => <div className={`layer-row ${activeSectionId === section.id ? "layer-row--active" : ""} ${!section.visible ? "layer-row--hidden" : ""}`} key={section.id}>
                <button type="button" className="layer-row__main" onClick={() => { setActiveSectionId(section.id); setShowInspector(true); }}><span className="layer-index">{String(index + 1).padStart(2, "0")}</span><span className="layer-name">{section.label}</span></button>
                <div className="layer-actions"><button type="button" aria-label={`Move ${section.label} up`} disabled={index === 0} onClick={() => moveSection(section.id, -1)}><ArrowUp size={12} /></button><button type="button" aria-label={`Move ${section.label} down`} disabled={index === blueprint.sections.length - 1} onClick={() => moveSection(section.id, 1)}><ArrowDown size={12} /></button><button type="button" aria-label={`${section.visible ? "Hide" : "Show"} ${section.label}`} onClick={() => toggleVisibility(section.id)}>{section.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button><button type="button" aria-label={`Remove ${section.label}`} onClick={() => removeSection(section.id)}><Trash2 size={12} /></button></div>
              </div>)}</div>
            </div>

            <div className="sidebar-section sidebar-section--projects">
              <div className="sidebar-section__heading"><div><span className="micro-label">YOUR WORK</span><h2>Recent projects</h2></div><button type="button" className="plain-icon" aria-label="Create new project" onClick={() => { setPrompt(SEED_PROMPT); startGeneratedProject(); }}><FilePlus2 size={15} /></button></div>
              <div className="project-search"><Search size={13} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a project" aria-label="Search projects" /></div>
              <div className="project-list">{filteredProjects.slice(0, 5).map((item) => <button type="button" key={item.id} className={`project-row ${item.id === project.id ? "project-row--active" : ""}`} onClick={() => activate(item)}><span className="project-row__icon"><Layers3 size={14} /></span><span className="project-row__copy"><strong>{item.name}</strong><small>{formatSaved(item.updatedAt)}</small></span><span className={`project-status ${item.blueprint.status === "published" ? "project-status--published" : ""}`} /></button>)}{filteredProjects.length === 0 && <span className="no-projects">No matching projects yet.</span>}</div>
              <div className="storage-note"><span className="storage-note__dot" />Drafts, revisions, and publish state stay in this browser.</div>
            </div>
          </div>
          <div className="brief-panel__bottom"><div className="avatar-mark">JD</div><div><strong>Jordan’s studio</strong><span>Local workspace</span></div><ChevronDown size={13} /></div>
        </aside>

        <main className="canvas-panel">
          <div className="canvas-toolbar">
            <div className="canvas-title"><div className="canvas-title__icon"><Layers3 size={15} /></div><div><strong>{blueprint.meta.title}</strong><span><span className="live-dot" /> LIVE CANVAS <i>·</i> v{project.version}</span></div></div>
            <div className="viewport-controls" role="group" aria-label="Preview size"><button type="button" aria-label="Desktop viewport" aria-pressed={viewport === "desktop"} className={viewport === "desktop" ? "is-selected" : ""} onClick={() => setViewport("desktop")}><Monitor size={15} /></button><button type="button" aria-label="Tablet viewport" aria-pressed={viewport === "tablet"} className={viewport === "tablet" ? "is-selected" : ""} onClick={() => setViewport("tablet")}><Tablet size={15} /></button><button type="button" aria-label="Mobile viewport" aria-pressed={viewport === "mobile"} className={viewport === "mobile" ? "is-selected" : ""} onClick={() => setViewport("mobile")}><Smartphone size={15} /></button></div>
            <div className="canvas-toolbar__actions"><button type="button" className="button button--canvas history-button" onClick={() => setHistoryOpen((value) => !value)}><History size={14} /><span>History</span></button><button type="button" className="button button--canvas" onClick={() => setShowBrief((value) => !value)}><Sparkles size={14} /><span>New brief</span></button><button type="button" className="button button--canvas button--icon" aria-label="Toggle inspector" onClick={() => setShowInspector((value) => !value)}><PanelRightClose size={15} /></button></div>
          </div>
          <div className="canvas-stage">
            {historyOpen && <div className="history-popover"><div className="history-popover__head"><div><strong>Revision history</strong><span>{project.revisions.length} saved checkpoints · latest v{project.version}</span></div><button type="button" aria-label="Close revision history" onClick={() => setHistoryOpen(false)}>×</button></div><div className="history-list">{[...project.revisions].reverse().map((revision) => <div className="history-row" key={`${project.id}-${revision.version}`}><div className="history-row__marker"><span /></div><div className="history-row__copy"><strong>Version {revision.version}{revision.version === project.version ? <i>Latest</i> : null}</strong><span>{new Date(revision.savedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span></div><button type="button" disabled={revision.version === project.version} onClick={() => restoreRevision(revision.snapshot, revision.version)}>Restore</button></div>)}</div><div className="history-popover__note">Restoring creates an editable draft; your saved history remains unchanged.</div></div>}
            <div className={`browser-window browser-window--${viewport}`}>
              <div className="browser-bar"><div className="browser-dots"><i /><i /><i /></div><div className="browser-address"><span>pageforge.local</span><span>/ {currentSlug}</span></div><button type="button" aria-label="Open preview link" onClick={() => setShareOpen(true)}><ExternalLink size={13} /></button></div>
              <div className="preview-scroll"><PagePreview blueprint={blueprint} selectedSectionId={activeSectionId} onSelectSection={(id) => { setActiveSectionId(id); setShowInspector(true); }} /></div>
            </div>
            {shareOpen && blueprint.status === "published" && <div className="share-popover"><button type="button" className="share-popover__close" onClick={() => setShareOpen(false)}>×</button><div className="share-popover__mark"><Check size={16} /></div><strong>Your local preview is ready</strong><p>This path works in the same browser profile. Public hosting is not connected in this workspace.</p><div className="share-url">{publishUrl}</div><div className="share-actions"><button type="button" className="button button--quiet" onClick={copyPublishUrl}><Copy size={14} />Copy link</button><a className="button button--primary" href={publishUrl} target="_blank" rel="noreferrer">Open preview <ExternalLink size={13} /></a></div></div>}
          </div>
          <div className="canvas-footbar"><div className="validation-indicator"><span className={pageIsValid ? "validation-indicator__icon" : "validation-indicator__icon validation-indicator__icon--error"}>{pageIsValid ? <Check size={12} /> : "!"}</span><span>{pageIsValid ? "Blueprint validated" : `${validation?.success === false ? validation.error.issues.length : 0} issue(s) to resolve`}</span><span className="footbar-divider" />{pageIsValid ? <span>Schema v{blueprint.schemaVersion} · Draft autosaved</span> : <span>{validation?.success === false ? validation.error.issues[0]?.message : "Invalid blueprint"}</span>}</div><span className="footbar-hint">{formatSaved(project.updatedAt)}</span></div>
        </main>

        <div className={`inspector-wrap ${showInspector ? "inspector-wrap--open" : ""}`}><BlueprintInspector blueprint={blueprint} selectedSection={selectedSection} onUpdateSection={updateSection} onUpdateMeta={(meta) => setBlueprint({ ...blueprint, meta })} onUpdateImageSlots={(imageSlots) => setBlueprint({ ...blueprint, imageSlots })} onUpdateTheme={(theme) => setBlueprint({ ...blueprint, theme })} /><button type="button" className="inspector-close" aria-label="Close inspector" onClick={() => setShowInspector(false)}>×</button></div>
      </div>
    </div>
  );
}

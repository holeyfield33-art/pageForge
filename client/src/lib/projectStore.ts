import { BLUEPRINT_VERSION, validateBlueprint, createId, slugify, type PageBlueprint } from "./blueprint";

const STORAGE_KEY = "pageforge.projects.v1";

export interface ProjectRevision {
  version: number;
  savedAt: string;
  snapshot: PageBlueprint;
}

export interface LocalProject {
  id: string;
  name: string;
  blueprint: PageBlueprint;
  version: number;
  revisions: ProjectRevision[];
  createdAt: string;
  updatedAt: string;
}

function safeRead(): LocalProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as unknown;
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const candidate = row as LocalProject;
      const source = candidate.blueprint as unknown;
      if (typeof candidate.id !== "string" || typeof source !== "object" || source === null || !Array.isArray((source as { sections?: unknown }).sections)) return [];

      const revisions: ProjectRevision[] = Array.isArray(candidate.revisions)
        ? candidate.revisions.flatMap((value) => {
          if (!value || typeof value !== "object") return [];
          const revision = value as ProjectRevision;
          if (!Number.isFinite(revision.version) || typeof revision.savedAt !== "string") return [];
          const parsedSnapshot = validateBlueprint(revision.snapshot);
          return parsedSnapshot.success ? [{ version: revision.version, savedAt: revision.savedAt, snapshot: parsedSnapshot.data }] : [];
        })
        : [];

      const parsed = validateBlueprint(source);
      let blueprint: PageBlueprint;
      if (parsed.success) {
        blueprint = parsed.data;
      } else {
        const rawVersion = (source as { schemaVersion?: unknown }).schemaVersion;
        if (rawVersion === BLUEPRINT_VERSION || rawVersion === "0.9.0") {
          // Preserve in-progress text/field edits for a supported schema version.
          blueprint = source as PageBlueprint;
        } else {
          // Never treat an unknown future schema as the active model. Recover from the
          // latest retained supported snapshot rather than silently accepting it.
          const fallback = [...revisions].reverse()[0]?.snapshot;
          if (!fallback) return [];
          blueprint = fallback;
        }
      }

      return [{
        ...candidate,
        blueprint,
        name: typeof candidate.name === "string" ? candidate.name : blueprint.meta.title,
        revisions,
        version: Number.isFinite(candidate.version) ? candidate.version : 1,
        createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
        updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
      }];
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function safeWrite(projects: LocalProject[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // A browser with storage disabled still keeps the active project in React state.
  }
}

export function listProjects(): LocalProject[] {
  return safeRead();
}

export function findProject(id: string): LocalProject | undefined {
  return safeRead().find((project) => project.id === id);
}

export function findPublishedProject(slug: string, id: string): LocalProject | undefined {
  const project = findProject(id);
  if (!project || project.blueprint.status !== "published" || project.blueprint.meta.slug !== slug) return undefined;
  return project;
}

export function createProject(blueprint: PageBlueprint): LocalProject {
  const now = new Date().toISOString();
  const project: LocalProject = {
    id: createId("project"),
    name: blueprint.meta.title,
    blueprint,
    version: 1,
    revisions: [{ version: 1, savedAt: now, snapshot: structuredClone(blueprint) }],
    createdAt: now,
    updatedAt: now,
  };
  safeWrite([project, ...safeRead()]);
  return project;
}

export function updateDraft(id: string, blueprint: PageBlueprint): LocalProject | undefined {
  const rows = safeRead();
  const index = rows.findIndex((project) => project.id === id);
  if (index < 0) return undefined;
  const next = { ...rows[index], name: blueprint.meta.title, blueprint, updatedAt: new Date().toISOString() };
  rows[index] = next;
  safeWrite(rows);
  return next;
}

export function saveRevision(id: string, blueprint: PageBlueprint): LocalProject | undefined {
  const rows = safeRead();
  const index = rows.findIndex((project) => project.id === id);
  if (index < 0) return undefined;
  const current = rows[index];
  const version = current.version + 1;
  const now = new Date().toISOString();
  const next: LocalProject = {
    ...current,
    name: blueprint.meta.title,
    blueprint,
    version,
    updatedAt: now,
    revisions: [...current.revisions, { version, savedAt: now, snapshot: structuredClone(blueprint) }].slice(-20),
  };
  rows[index] = next;
  safeWrite(rows);
  return next;
}

export function duplicateProject(id: string): LocalProject | undefined {
  const source = findProject(id);
  if (!source) return undefined;
  const blueprint = structuredClone(source.blueprint);
  const nextTitle = `${blueprint.meta.title} Copy`.slice(0, 100);
  blueprint.id = createId("blueprint");
  blueprint.meta.title = nextTitle;
  blueprint.meta.slug = slugify(`${blueprint.meta.slug}-copy`);
  blueprint.status = "draft";
  blueprint.sections = blueprint.sections.map((section) => ({ ...section, id: createId("section") })) as PageBlueprint["sections"];
  return createProject(blueprint);
}

export function setPublished(id: string, blueprint: PageBlueprint): LocalProject | undefined {
  const updated: PageBlueprint = { ...blueprint, status: blueprint.status === "published" ? "draft" : "published" };
  return saveRevision(id, updated);
}

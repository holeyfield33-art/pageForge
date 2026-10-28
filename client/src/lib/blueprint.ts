import { z } from "zod";

export const BLUEPRINT_VERSION = "1.0.0";

// 3D hero scenes. New ids only extend this list, so older drafts stay valid.
export const SCENE_IDS = ["orb", "rings", "crystal", "blob", "wave", "stack", "helix", "constellation"] as const;
export type SceneId = (typeof SCENE_IDS)[number];
export const SCENE_LABELS: Record<SceneId, string> = {
  orb: "Iridescent orb",
  rings: "Orbiting rings",
  crystal: "Faceted crystal",
  blob: "Liquid blob",
  wave: "Signal wave",
  stack: "Floating stack",
  helix: "Double helix",
  constellation: "Constellation",
};

const HexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hex color.");
const BaseSection = {
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  visible: z.boolean(),
};

export const SectionSchema = z.discriminatedUnion("type", [
  z.object({
    ...BaseSection,
    type: z.literal("hero"),
    props: z.object({ eyebrow: z.string().max(80), headline: z.string().min(1).max(120), subheadline: z.string().max(240), ctaLabel: z.string().max(48), ctaHref: z.string().max(240), scene: z.enum(SCENE_IDS) }),
  }),
  z.object({
    ...BaseSection,
    type: z.literal("features"),
    props: z.object({ heading: z.string().max(120), intro: z.string().max(240), items: z.array(z.object({ id: z.string(), title: z.string().max(80), description: z.string().max(180) })).max(6) }),
  }),
  z.object({
    ...BaseSection,
    type: z.literal("gallery"),
    props: z.object({ heading: z.string().max(120), intro: z.string().max(220), items: z.array(z.object({ id: z.string(), title: z.string().max(80), note: z.string().max(100), color: HexColor })).max(6) }),
  }),
  z.object({
    ...BaseSection,
    type: z.literal("proof"),
    props: z.object({ heading: z.string().max(120), quote: z.string().max(280), author: z.string().max(80), role: z.string().max(100) }),
  }),
  z.object({
    ...BaseSection,
    type: z.literal("cta"),
    props: z.object({ heading: z.string().max(120), body: z.string().max(220), ctaLabel: z.string().max(48), ctaHref: z.string().max(240) }),
  }),
  z.object({
    ...BaseSection,
    type: z.literal("faq"),
    props: z.object({ heading: z.string().max(120), items: z.array(z.object({ id: z.string(), question: z.string().max(140), answer: z.string().max(260) })).max(8) }),
  }),
  z.object({
    ...BaseSection,
    type: z.literal("footer"),
    props: z.object({ brand: z.string().max(80), note: z.string().max(180), email: z.string().max(120) }),
  }),
]);

export const BlueprintSchema = z.object({
  schemaVersion: z.literal(BLUEPRINT_VERSION),
  id: z.string().min(1),
  status: z.enum(["draft", "published"]),
  meta: z.object({
    title: z.string().min(1).max(100),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
    description: z.string().max(500),
    locale: z.string().min(2).max(20),
    seo: z.object({
      metaTitle: z.string().max(60),
      metaDescription: z.string().max(160),
      keywords: z.array(z.string().max(40)).max(12),
      canonicalUrl: z.string().max(300),
    }),
  }),
  theme: z.object({
    primary: HexColor,
    secondary: HexColor,
    accent: HexColor,
    background: HexColor,
    surface: HexColor,
    text: HexColor,
    headingFont: z.string().min(1).max(80),
    bodyFont: z.string().min(1).max(80),
  }),
  imageSlots: z.record(z.string(), z.string()),
  sections: z.array(SectionSchema).min(1).max(24),
});

export type Section = z.infer<typeof SectionSchema>;
export type PageBlueprint = z.infer<typeof BlueprintSchema>;
export type SectionType = Section["type"];

const migrations: Record<string, (source: Record<string, unknown>) => Record<string, unknown>> = {
  "0.9.0": (source) => {
    const meta = typeof source.meta === "object" && source.meta !== null
      ? source.meta as Record<string, unknown>
      : {};
    return {
      ...source,
      schemaVersion: BLUEPRINT_VERSION,
      meta: {
        ...meta,
        locale: meta.locale ?? "en-US",
        seo: meta.seo ?? { metaTitle: "", metaDescription: "", keywords: [], canonicalUrl: "" },
      },
    };
  },
};

export function migrateBlueprint(value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
  let current = value as Record<string, unknown>;
  const migrate = migrations[String(current.schemaVersion ?? "")];
  if (migrate) current = migrate(current);
  return current;
}

export function validateBlueprint(value: unknown) {
  return BlueprintSchema.safeParse(migrateBlueprint(value));
}

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "untitled-page";
}

export function createId(prefix = "item"): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${id}`;
}

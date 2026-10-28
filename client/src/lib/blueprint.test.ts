import { describe, expect, it } from "vitest";
import { BLUEPRINT_VERSION, SCENE_IDS, slugify, validateBlueprint } from "./blueprint";
import { createSection, generateBlueprint, inferScene, TEMPLATE_OPTIONS } from "./generator";

const BRIEFS = [
  "A landing page for a design-forward skincare brand with a dreamy 3D hero.",
  "A modern SaaS launch page for a product analytics startup with a clear demo signup.",
  "A warm landing page for a neighborhood café with a menu and reservation CTA.",
  "A portfolio for an independent architect called Line & Light, with FAQ about process.",
  "A biotech lab announcing a new genetic test",
  "",
];

describe("generated blueprints", () => {
  it.each(BRIEFS)("validate for brief %j", (brief) => {
    const result = validateBlueprint(generateBlueprint(brief));
    expect(result.success, result.success ? "" : JSON.stringify(result.error.issues)).toBe(true);
  });

  it.each(TEMPLATE_OPTIONS.map((t) => t.id))("validate for template %s", (id) => {
    expect(validateBlueprint(generateBlueprint("anything", id)).success).toBe(true);
  });

  it("adds an FAQ only when the brief asks for one", () => {
    expect(generateBlueprint(BRIEFS[3]).sections.some((s) => s.type === "faq")).toBe(true);
    expect(generateBlueprint(BRIEFS[1]).sections.some((s) => s.type === "faq")).toBe(false);
  });

  it("never ships an invented testimonial", () => {
    const proof = generateBlueprint(BRIEFS[0]).sections.find((s) => s.type === "proof");
    expect(proof?.type === "proof" && proof.props.author).toBe("Customer name");
    const added = createSection("proof", generateBlueprint("").theme);
    expect(added.type === "proof" && added.props.quote).toMatch(/^Replace this/);
  });
});

describe("scene choice", () => {
  it.each([
    ["skincare brand", "blob"],
    ["product analytics startup", "wave"],
    ["biotech lab", "helix"],
    ["an AI developer platform", "constellation"],
    ["an architect's portfolio", "stack"],
  ] as const)("%s -> %s", (brief, scene) => {
    expect(inferScene(brief, "orb")).toBe(scene);
  });

  it("keeps the template scene when nothing matches", () => {
    expect(inferScene("a bakery with fresh bread", "crystal")).toBe("crystal");
  });

  it("does not read 'ai' inside other words", () => {
    expect(inferScene("a chair maker in Spain", "orb")).toBe("orb");
  });

  it.each(SCENE_IDS)("accepts every scene id in the schema (%s)", (scene) => {
    const blueprint = generateBlueprint(BRIEFS[0]);
    const hero = blueprint.sections.find((s) => s.type === "hero");
    if (hero?.type !== "hero") throw new Error("no hero");
    hero.props.scene = scene;
    expect(validateBlueprint(blueprint).success).toBe(true);
  });
});

describe("schema", () => {
  it("migrates 0.9.0 drafts that lack locale and SEO", () => {
    const current = generateBlueprint(BRIEFS[0]);
    const old = { ...current, schemaVersion: "0.9.0", meta: { title: current.meta.title, slug: current.meta.slug, description: "" } };
    const result = validateBlueprint(old);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schemaVersion).toBe(BLUEPRINT_VERSION);
      expect(result.data.meta.locale).toBe("en-US");
    }
  });

  it("rejects an unknown scene", () => {
    const blueprint = generateBlueprint(BRIEFS[0]) as unknown as { sections: { type: string; props: { scene?: string } }[] };
    blueprint.sections[0].props.scene = "teapot";
    expect(validateBlueprint(blueprint).success).toBe(false);
  });

  it("slugifies titles", () => {
    expect(slugify("  Line & Light — Studio!  ")).toBe("line-light-studio");
    expect(slugify("!!!")).toBe("untitled-page");
  });
});

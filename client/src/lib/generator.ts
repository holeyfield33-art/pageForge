import { BLUEPRINT_VERSION, createId, slugify, type PageBlueprint, type Section, type SectionType } from "./blueprint";

export interface TemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  marker: string;
  theme: PageBlueprint["theme"];
  scene: "orb" | "rings" | "crystal";
}

const palettes = {
  violet: { primary: "#a78bfa", secondary: "#c4b5fd", accent: "#d8ff76", background: "#11111b", surface: "#1a1a29", text: "#f5f3ff", headingFont: "Space Grotesk", bodyFont: "DM Sans" },
  coral: { primary: "#fb7185", secondary: "#fecdd3", accent: "#ffcf70", background: "#171113", surface: "#24191c", text: "#fff4f4", headingFont: "Space Grotesk", bodyFont: "DM Sans" },
  blue: { primary: "#67e8f9", secondary: "#a5f3fc", accent: "#c7f36b", background: "#0e1722", surface: "#152333", text: "#effaff", headingFont: "Space Grotesk", bodyFont: "DM Sans" },
  green: { primary: "#86efac", secondary: "#bbf7d0", accent: "#f5e56b", background: "#101914", surface: "#18241d", text: "#f1fff5", headingFont: "Space Grotesk", bodyFont: "DM Sans" },
};

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: "saas-launch", name: "Signal SaaS", category: "Software", description: "A focused launch page with product proof and a strong signup path.", marker: "SaaS", theme: palettes.violet, scene: "orb" },
  { id: "product-drop", name: "Object Studio", category: "Product", description: "A tactile product showcase with a sculptural 3D hero.", marker: "Product", theme: palettes.coral, scene: "crystal" },
  { id: "creative-studio", name: "Form & Field", category: "Portfolio", description: "An editorial canvas for a creative practice or independent studio.", marker: "Studio", theme: palettes.blue, scene: "rings" },
  { id: "table-story", name: "Table Story", category: "Hospitality", description: "A warm digital front door for a restaurant or neighborhood café.", marker: "Hospitality", theme: palettes.green, scene: "orb" },
];

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function inferTemplate(prompt: string): TemplateOption {
  const text = prompt.toLowerCase();
  if (/restaurant|cafe|café|bakery|menu|dining|food|hospitality/.test(text)) return TEMPLATE_OPTIONS[3];
  if (/portfolio|designer|artist|studio|agency|architect|photographer|creative/.test(text)) return TEMPLATE_OPTIONS[2];
  if (/product|shop|store|skincare|launch|e-?commerce|brand/.test(text)) return TEMPLATE_OPTIONS[1];
  return TEMPLATE_OPTIONS[0];
}

function inferTitle(prompt: string, fallback: string): string {
  const match = prompt.match(/(?:for|called|named)\s+(?:a|an|the)?\s*([^,.!?]+?)(?=\s+(?:with|that|focused on|featuring|and)\b|[.!?]|$)/i);
  if (!match?.[1]) return fallback;
  const candidate = match[1].trim().replace(/\s+/g, " ").slice(0, 40);
  return titleCase(candidate) || fallback;
}

function makeSections(template: TemplateOption, title: string, prompt: string): Section[] {
  const shortBrand = title.split(/[—|–]/)[0].trim();
  const base: Section[] = [
    {
      id: createId("section"), type: "hero", label: "Hero", visible: true,
      props: {
        eyebrow: template.marker.toUpperCase(),
        headline: template.id === "saas-launch" ? "Make your next idea impossible to ignore." : template.id === "product-drop" ? "Objects with a point of view." : template.id === "creative-studio" ? "A studio for ideas in motion." : "Good things happen around the table.",
        subheadline: template.id === "saas-launch" ? "A clearer way to bring your best work into the world." : template.description,
        ctaLabel: template.id === "table-story" ? "Explore the menu" : "Explore the collection",
        ctaHref: "#details",
        scene: template.scene,
      },
    },
    {
      id: createId("section"), type: "features", label: "What makes it different", visible: true,
      props: {
        heading: "Small details. Big difference.",
        intro: "A few reasons people choose us, and stay.",
        items: [
          { id: createId("feature"), title: "Made with intent", description: "Thoughtful choices from the first sketch to the final detail." },
          { id: createId("feature"), title: "Built to feel right", description: "A distinctive experience that works beautifully at every size." },
          { id: createId("feature"), title: "Ready for what’s next", description: "A flexible foundation that can grow with your next big idea." },
        ],
      },
    },
    {
      id: createId("section"), type: "gallery", label: "Featured work", visible: true,
      props: {
        heading: "A closer look",
        intro: "A selection of the things we’re proud to put our name on.",
        items: [
          { id: createId("tile"), title: "The first impression", note: "01 / Signature", color: template.theme.primary },
          { id: createId("tile"), title: "The thoughtful detail", note: "02 / Craft", color: template.theme.accent },
          { id: createId("tile"), title: "The lasting feeling", note: "03 / Experience", color: template.theme.secondary },
        ],
      },
    },
    {
      id: createId("section"), type: "proof", label: "A little proof", visible: true,
      props: { heading: "Good work travels.", quote: "They understood the feeling we wanted to create before we could put it into words.", author: "Alex Morgan", role: "Founder, Fieldnote" },
    },
    {
      id: createId("section"), type: "cta", label: "Call to action", visible: true,
      props: { heading: "Your next favorite starts here.", body: "Take a closer look and see what feels right for you.", ctaLabel: "Let’s make it happen", ctaHref: "mailto:hello@example.com" },
    },
    {
      id: createId("section"), type: "footer", label: "Footer", visible: true,
      props: { brand: shortBrand || "Pageforge", note: "Designed with intention. Made for what’s next.", email: "hello@example.com" },
    },
  ];

  if (/faq|questions|how it works|shipping|returns/.test(prompt.toLowerCase())) {
    base.splice(4, 0, {
      id: createId("section"), type: "faq", label: "Frequently asked", visible: true,
      props: { heading: "A few things you might be wondering", items: [
        { id: createId("faq"), question: "How do I get started?", answer: "Tell us what you’re looking for and we’ll help you find the right fit." },
        { id: createId("faq"), question: "Can I change my mind?", answer: "Absolutely. This page is only the beginning of the conversation." },
      ] },
    });
  }
  return base;
}

export function generateBlueprint(prompt: string, preferredTemplate?: string): PageBlueprint {
  const source = prompt.trim() || "A modern product launch with a sculptural 3D hero";
  const template = TEMPLATE_OPTIONS.find((item) => item.id === preferredTemplate) ?? inferTemplate(source);
  const title = inferTitle(source, template.id === "saas-launch" ? "Northstar Studio" : template.id === "product-drop" ? "Objects in Form" : template.id === "creative-studio" ? "Form & Field" : "Table Story");
  const sections = makeSections(template, title, source);
  const blueprint: PageBlueprint = {
    schemaVersion: BLUEPRINT_VERSION,
    id: createId("blueprint"),
    status: "draft",
    meta: {
      title,
      slug: slugify(title),
      description: source.slice(0, 500),
      locale: "en-US",
      seo: { metaTitle: title.slice(0, 60), metaDescription: source.slice(0, 160), keywords: [], canonicalUrl: "" },
    },
    theme: { ...template.theme },
    imageSlots: { hero: "procedural-3d", feature: "replaceable" },
    sections,
  };
  return blueprint;
}

export function createSection(type: SectionType, theme: PageBlueprint["theme"]): Section {
  const id = createId("section");
  switch (type) {
    case "hero": return { id, type, label: "Hero", visible: true, props: { eyebrow: "NEW / 2026", headline: "A clearer way to show up.", subheadline: "A little more thought in every detail.", ctaLabel: "Explore more", ctaHref: "#details", scene: "orb" } };
    case "features": return { id, type, label: "Features", visible: true, props: { heading: "Made for the details", intro: "The things that make a difference.", items: [{ id: createId("feature"), title: "First feature", description: "Describe a meaningful benefit." }] } };
    case "gallery": return { id, type, label: "Gallery", visible: true, props: { heading: "A closer look", intro: "A few favorites from the collection.", items: [{ id: createId("tile"), title: "Featured work", note: "01 / Feature", color: theme.primary }] } };
    case "proof": return { id, type, label: "Social proof", visible: true, props: { heading: "A little proof.", quote: "They made the whole experience feel effortless.", author: "Jordan Lee", role: "Customer" } };
    case "cta": return { id, type, label: "Call to action", visible: true, props: { heading: "Ready when you are.", body: "Take the next step with confidence.", ctaLabel: "Get in touch", ctaHref: "mailto:hello@example.com" } };
    case "faq": return { id, type, label: "FAQ", visible: true, props: { heading: "Frequently asked", items: [{ id: createId("faq"), question: "How does it work?", answer: "Tell us what you need and we’ll take it from there." }] } };
    case "footer": return { id, type, label: "Footer", visible: true, props: { brand: "Pageforge", note: "Made with intention.", email: "hello@example.com" } };
  }
}

export function getTemplate(id: string) {
  return TEMPLATE_OPTIONS.find((template) => template.id === id) ?? TEMPLATE_OPTIONS[0];
}

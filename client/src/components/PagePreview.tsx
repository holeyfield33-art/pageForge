import { ArrowRight, ArrowUpRight, Check, CirclePlay, Sparkles, Star } from "lucide-react";
import { lazy, Suspense, useEffect } from "react";
import type { CSSProperties } from "react";
import type { PageBlueprint, Section } from "@/lib/blueprint";

const ThreeHero = lazy(() => import("./ThreeHero"));

type Props = { blueprint: PageBlueprint; onSelectSection?: (id: string) => void; selectedSectionId?: string };
type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

function themeStyle(blueprint: PageBlueprint): ThemeStyle {
  return {
    "--page-primary": blueprint.theme.primary,
    "--page-secondary": blueprint.theme.secondary,
    "--page-accent": blueprint.theme.accent,
    "--page-background": blueprint.theme.background,
    "--page-surface": blueprint.theme.surface,
    "--page-text": blueprint.theme.text,
    "--page-heading-font": `"${blueprint.theme.headingFont}", sans-serif`,
    "--page-body-font": `"${blueprint.theme.bodyFont}", sans-serif`,
  };
}

function resolveImageReference(reference?: string): string | undefined {
  if (!reference) return undefined;
  if (/^https:\/\//i.test(reference) || (reference.startsWith("/") && !reference.startsWith("//"))) return reference;
  return undefined;
}

function GeneratedSection({ section, blueprint, onSelectSection, selected }: { section: Section; blueprint: PageBlueprint; onSelectSection?: (id: string) => void; selected: boolean }) {
  const focus = () => onSelectSection?.(section.id);
  const selectClass = selected ? " generated-section--selected" : "";
  const heroImage = resolveImageReference(blueprint.imageSlots.hero);
  const featureImage = resolveImageReference(blueprint.imageSlots.feature);
  switch (section.type) {
    case "hero":
      return (
        <section id="top" className={`generated-hero generated-section${selectClass}`} onClick={focus}>
          {heroImage && <img className="generated-hero__media" src={heroImage} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
          <Suspense fallback={<div className="three-hero"><div className="three-hero__fallback-orb" /></div>}>
            <ThreeHero primary={blueprint.theme.primary} accent={blueprint.theme.accent} scene={section.props.scene} />
          </Suspense>
          <div className="generated-hero__copy">
            <div className="generated-eyebrow"><span className="status-dot" />{section.props.eyebrow}</div>
            <h1>{section.props.headline}</h1>
            <p>{section.props.subheadline}</p>
            <a className="generated-button" href={section.props.ctaHref}>{section.props.ctaLabel}<ArrowRight size={15} /></a>
            <div className="generated-hero__caption"><span>FORM / 3D STUDY</span><span>01 — 04</span></div>
          </div>
          <div className="generated-hero__scroll">SCROLL TO EXPLORE <span>↓</span></div>
        </section>
      );
    case "features":
      return (
        <section id="details" className={`generated-features generated-section${selectClass}`} onClick={focus}>
          {featureImage && <img className="generated-features__media" src={featureImage} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
          <div className="generated-section-kicker">01 / THE APPROACH</div>
          <div className="generated-section-heading"><h2>{section.props.heading}</h2><p>{section.props.intro}</p></div>
          <div className="generated-feature-grid">
            {section.props.items.map((item, index) => (
              <article className="generated-feature" key={item.id}>
                <div className="generated-feature__number">0{index + 1}</div>
                <div className="generated-feature__mark"><Sparkles size={18} /></div>
                <h3>{item.title}</h3><p>{item.description}</p>
                <ArrowUpRight className="generated-feature__arrow" size={16} />
              </article>
            ))}
          </div>
        </section>
      );
    case "gallery":
      return (
        <section className={`generated-gallery generated-section${selectClass}`} onClick={focus}>
          <div className="generated-section-kicker">02 / SELECTED WORK</div>
          <div className="generated-section-heading"><h2>{section.props.heading}</h2><p>{section.props.intro}</p></div>
          <div className="generated-gallery-grid">
            {section.props.items.map((item, index) => (
              <article className={`generated-work generated-work--${index + 1}`} key={item.id} style={{ "--work-color": item.color } as CSSProperties}>
                <div className="generated-work__art"><div className="generated-work__shape" /><div className="generated-work__ring" /></div>
                <div className="generated-work__caption"><div><span>{item.note}</span><h3>{item.title}</h3></div><ArrowUpRight size={17} /></div>
              </article>
            ))}
          </div>
        </section>
      );
    case "proof":
      return (
        <section className={`generated-proof generated-section${selectClass}`} onClick={focus}>
          <div className="generated-section-kicker">03 / WORD OF MOUTH</div>
          <div className="generated-proof__body"><div className="generated-stars"><Star /><Star /><Star /><Star /><Star /></div><h2>“{section.props.quote}”</h2><p>{section.props.author} <span>— {section.props.role}</span></p></div>
          <div className="generated-proof__side">{section.props.heading}</div>
        </section>
      );
    case "cta":
      return (
        <section className={`generated-cta generated-section${selectClass}`} onClick={focus}>
          <div className="generated-cta__orb" />
          <div className="generated-section-kicker">04 / YOUR NEXT MOVE</div>
          <div className="generated-cta__content"><h2>{section.props.heading}</h2><p>{section.props.body}</p><a className="generated-button generated-button--light" href={section.props.ctaHref}>{section.props.ctaLabel}<ArrowRight size={15} /></a></div>
          <div className="generated-cta__index">LET’S MAKE SOMETHING<br />WORTH REMEMBERING.</div>
        </section>
      );
    case "faq":
      return (
        <section className={`generated-faq generated-section${selectClass}`} onClick={focus}>
          <div className="generated-section-kicker">FAQ / THE DETAILS</div><h2>{section.props.heading}</h2>
          <div className="generated-faq__items">{section.props.items.map((item) => <details key={item.id}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div>
        </section>
      );
    case "footer":
      return (
        <footer className={`generated-footer generated-section${selectClass}`} onClick={focus}>
          <div className="generated-footer__brand"><span className="brand-glyph brand-glyph--mini">P</span><strong>{section.props.brand}</strong></div><p>{section.props.note}</p><a href={`mailto:${section.props.email}`}>{section.props.email}<ArrowUpRight size={14} /></a><span className="generated-footer__copy">© 2026 {section.props.brand}</span>
        </footer>
      );
  }
}

export default function PagePreview({ blueprint, onSelectSection, selectedSectionId }: Props) {
  const visible = [...blueprint.sections].filter((section) => section.visible).sort((a, b) => blueprint.sections.indexOf(a) - blueprint.sections.indexOf(b));
  const keywords = blueprint.meta.seo.keywords.join(", ");

  useEffect(() => {
    const title = blueprint.meta.seo.metaTitle || blueprint.meta.title;
    const description = blueprint.meta.seo.metaDescription || blueprint.meta.description;
    document.title = title;
    document.documentElement.lang = blueprint.meta.locale || "en";
    const setMeta = (name: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };
    setMeta("description", description);
    setMeta("keywords", keywords);

    const value = blueprint.meta.seo.canonicalUrl.trim();
    let canonical: URL | undefined;
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") canonical = parsed;
    } catch {
      canonical = undefined;
    }
    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical.href;
    } else {
      canonicalLink?.remove();
    }
  }, [blueprint.meta.description, blueprint.meta.locale, blueprint.meta.seo.canonicalUrl, blueprint.meta.seo.metaDescription, blueprint.meta.seo.metaTitle, blueprint.meta.title, keywords]);

  return (
    <div className="generated-page" style={themeStyle(blueprint)}>
      <div className="generated-nav"><a className="generated-nav__brand" href="#top"><span className="generated-nav__glyph">{blueprint.meta.title.slice(0, 1)}</span>{blueprint.meta.title}</a><div className="generated-nav__links"><a href="#details">Discover</a><a href="#details">The details</a><a className="generated-nav__cta" href="#details">Let’s talk <ArrowUpRight size={13} /></a></div><button className="generated-nav__play" type="button" aria-label="Play preview"><CirclePlay size={18} /></button></div>
      <main>{visible.map((section) => <GeneratedSection key={section.id} section={section} blueprint={blueprint} onSelectSection={onSelectSection} selected={selectedSectionId === section.id} />)}</main>
      <div className="generated-page__signature"><span><Check size={12} /> Blueprint validated</span><span>Made with Pageforge</span></div>
    </div>
  );
}

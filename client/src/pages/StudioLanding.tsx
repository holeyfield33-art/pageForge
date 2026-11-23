import { lazy, Suspense } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Layers3, ShieldCheck } from "lucide-react";
import "./StudioLanding.css";

const ThreeHero = lazy(() => import("../components/ThreeHero"));
const email = "enkidagoat@gmail.com";
const subject = encodeURIComponent("Ship-Ready Audit — Project Inquiry");
const body = encodeURIComponent("Project name:\nRepository or export link:\nWhat does your app do?\nMain concern:\nI own this project or am authorized to request a review: Yes / No\n\nPlease confirm scope before payment. I understand live testing requires separate written authorization.");
const inquiry = `mailto:${email}?subject=${subject}&body=${body}`;

export default function StudioLanding() {
  return (
    <div className="studio-site">
      <header className="studio-nav">
        <a href="#top" className="studio-brand"><Layers3 size={23} aria-hidden="true" /><span>ALETHEIA <b>/ STUDIO</b></span></a>
        <a className="studio-nav-link" href="#process">The process</a>
        <a className="studio-nav-cta" href={inquiry}>Request an audit <ArrowUpRight size={16}/></a>
      </header>
      <main>
        <section className="studio-hero" id="top">
          <div className="studio-hero-copy">
            <div className="studio-eyebrow"><span className="studio-dot"/> SOFTWARE RESEARCH STUDIO <span className="studio-rule"/></div>
            <h1>Your AI built the app.<br/><em>Do you understand</em><br/>what's inside?</h1>
            <p>An independent engineering review for AI-built applications. Understand what works, what needs fixing, and what to do next.</p>
            <div className="studio-actions"><a className="studio-button" href={inquiry}>Request an Audit <ArrowRight size={18}/></a><span className="studio-price">$99 <small>/ founding-client audit</small></span></div>
            <div className="studio-hero-foot"><span>THREE FOUNDING-CLIENT SPOTS</span><span>01 — ENGINEERING INTELLIGENCE</span></div>
          </div>
          <div className="studio-scene" aria-label="Interactive floating stack of layered software architecture forms">
            <Suspense fallback={<div className="studio-scene-loading">Loading 3D scene…</div>}>
              <ThreeHero scene="stack" primary="#C88C5C" accent="#F3E4CF" secondary="#A86C48"/>
            </Suspense>
            <div className="studio-scene-label"><span>FIG. 01</span><span>THE SYSTEM BENEATH THE SURFACE</span></div>
          </div>
        </section>
        <section className="studio-strip" aria-label="Audit approach"><span>NO GUESSWORK</span><span>•</span><span>OBSERVABLE EVIDENCE</span><span>•</span><span>DECISIONS YOU CAN ACT ON</span></section>
        <section className="studio-section" id="process">
          <div className="studio-section-intro"><span className="studio-kicker">01 / THE PROCESS</span><h2>Know what you're<br/><em>shipping.</em></h2><p>A focused review, not an endless engineering project. We surface the most important gaps and explain what deserves attention.</p></div>
          <div className="studio-steps">
            <article><span>01</span><h3>Inspect</h3><p>Review one repository or project export, with static code triage and an agreed scope.</p></article>
            <article><span>02</span><h3>Understand</h3><p>Identify observed engineering gaps, their evidence, and what hasn't been tested.</p></article>
            <article><span>03</span><h3>Improve</h3><p>Receive a practical Keep / Fix / Rebuild recommendation and prioritized next steps.</p></article>
          </div>
        </section>
        <section className="studio-deliverables" id="offer">
          <div><span className="studio-kicker">02 / THE OFFER</span><h2>Clarity before<br/><em>complexity.</em></h2><p>One project. One concise, evidence-backed assessment. No unnecessary rebuilds or invented guarantees.</p></div>
          <div className="studio-offer-card"><span>FOUNDING-CLIENT PILOT</span><div className="studio-offer-price">$99</div><p>Per project · 3 pilot spots</p><ul><li><CheckCircle2/> Static code triage</li><li><CheckCircle2/> Focused auth, data-access and configuration review</li><li><CheckCircle2/> Findings with evidence and limitations</li><li><CheckCircle2/> Keep / Fix / Rebuild recommendation</li></ul><a className="studio-button" href={inquiry}>Request your audit <ArrowRight size={18}/></a></div>
        </section>
        <section className="studio-disclaimer"><ShieldCheck size={20}/><p>A Ship-Ready Audit is a limited engineering assessment, not a penetration test, security certification, or guarantee of security. Live testing is never included without separate written authorization and an agreed scope. Payment is arranged only after scope acceptance.</p></section>
        <section className="studio-end"><span className="studio-kicker">03 / NEXT STEP</span><h2>Make the next<br/><em>decision count.</em></h2><a href={inquiry} className="studio-button">Request an Audit <ArrowRight size={18}/></a></section>
      </main>
      <footer className="studio-footer"><span>ALETHEIA / SOFTWARE RESEARCH STUDIO</span><span>© 2026 ALETHEIA</span><a href={`mailto:${email}`}>CONTACT <ArrowUpRight size={14}/></a></footer>
    </div>
  );
}

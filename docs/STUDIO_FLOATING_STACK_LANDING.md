# Software Research Studio — Floating Stack landing page

Status: approved implementation brief for SRS-COM-001. This is a commercial landing page in PageForge, not a Studio kernel integration.

## Source and scope
- Studio authority: `software-research-studio/docs/PRODUCT_INTENT.md` (Build mode, minimality, proportionate verification); `docs/CURRENT_STATUS.md` (003R selector NO-GO, product integration NO-GO).
- Use PageForge's **existing** Floating Stack procedural Three.js scene and page/blueprint infrastructure. Do not replace it with an image or unrelated 3D implementation.
- Domain target: `aletheia-core.com` root, pending verified hosting and DNS configuration. Do not alter DNS as part of design work.
- Palette: charcoal, ivory, copper. Maintain readable contrast, mobile responsiveness, reduced-motion fallback and existing PageForge scene lifecycle.

## Offer and content
- Brand: Software Research Studio by Aletheia.
- Hero headline: “Your AI built the app. Do you understand what's inside?”
- Supporting copy: “An independent engineering review of your AI-built application. Understand what works, what needs fixing, and what to do next.”
- Primary CTA: “Request an Audit”. Do not imply a functioning submission flow until the destination is verified.
- Pilot: $99 per project; three founding-client spots (do not imply slots are booked).
- Process: Inspect → Understand → Improve.
- Deliverable: evidence-backed findings and a Keep / Fix / Rebuild recommendation, with an insufficient-evidence option.
- Include scope limitations: limited engineering assessment, not a penetration test or security certification; separate written authorization required for live testing.

## Constraints
- No payment collection, subscription, accounts, new backend or Studio kernel changes.
- No unverified performance, security-certification or automated-scan claims.
- No production deployment until hosting target, CTA intake endpoint, and DNS are confirmed.

## Acceptance
1. Existing Floating Stack scene renders as the real interactive hero, including mobile and reduced-motion behavior.
2. Copy is specific to Studio and the $99 pilot, with honest limitations.
3. Existing PageForge tests, typecheck and static build pass; inspect desktop and mobile.
4. Existing PageForge editor and other scene choices do not regress.
5. Record exact deployed host and DNS only after verification; do not invent configuration.

# Editorial image system

This guide explains how the portfolio's project and article imagery was produced, how assets are selected at runtime, and how to extend the system without drifting into generic AI imagery or unsupported product screenshots.

## What the system is

The site uses two image families:

1. **One documentary hero image** — `public/images/engineering-notes.webp` is a curated desk study used only by the homepage hero.
2. **A symbolic SVG series** — `public/images/editorial/*.svg` translates an engineering idea into sparse architectural or documentary geometry.

The symbolic studies began in an Open Design Cloud editorial artifact. The selected SVGs were then copied into the repository, reviewed, and mapped to content. There is no runtime or build-time image-generation service: the committed files are ordinary, deterministic assets served by Astro.

## Why symbolic images

A project screenshot can imply a finished interface, production deployment, metric, or capability that the evidence does not support. The SVGs instead illustrate the documented engineering mechanism:

- a threshold for trusted ingress;
- obscured lines for fail-closed redaction;
- shelves for local retrieval;
- connected document planes for citations;
- a ruled ledger for evidence approval;
- a plan with handoff points for routing.

The image should make the project's central boundary legible without pretending to be proof of a UI or outcome.

## Visual grammar

Every new study should follow the existing family:

- `viewBox="0 0 1200 760"`;
- flat SVG geometry with a small number of paths, rectangles, lines, and circles;
- paper, graphite, and slate neutrals;
- one restrained rust-red marker for the decision, handoff, or unresolved edge;
- crisp edges, generous negative space, and no ornamental container;
- no gradients, glow, glass, heavy shadows, robots, brains, neon, logos, fake metrics, or generic code windows;
- no real identifiers, customer data, private documents, or confidential interface details;
- enough central breathing room to survive the card and mobile crops.

The current SVGs intentionally remain tiny and dependency-free. Do not add an illustration library for this system.

## Current semantic map

Project and article selection lives in `src/lib/visuals.ts`.

| Content | Asset | Meaning |
| --- | --- | --- |
| Career Copilot | `trust-boundary.svg` | trusted request context and ingress |
| mastra-pii | `redaction-study.svg` | fail-closed redaction |
| DocNeedle | `retrieval-shelves.svg` | indexed local documentation |
| SSI Sales Intelligence Agent | `evidence-ledger.svg` | evidence and publication approval |
| Scavenger | `routing-plan.svg` | explicit task routing and handoffs |
| Benchmark-harness article | `approval-desk.svg` | separate product and evaluation review |

Articles reuse their related project's image when they explain the same mechanism. A unique article gets its own mapping only when its thesis needs a different symbol.

`getProjectVisual()` currently falls back to the DocNeedle retrieval study, while `getArticleVisual()` falls back to the approval desk. These fallbacks keep local drafts renderable; they are not a substitute for choosing an intentional image before publication.

The Writing index separately uses `trust-boundary.svg` and `redaction-study.svg` as an introductory pair. Update `src/pages/writing.astro` only when the index's image language changes; project and article detail pages should continue using the central mapping helpers.

## Runtime flow

```text
content slug
   ↓
getProjectVisual() / getArticleVisual()
   ↓
{ src, alt, caption, position? }
   ↓
ProjectCard or route template
   ↓
/public/images/... asset
```

`EditorialVisual` keeps the contract deliberately small:

```ts
interface EditorialVisual {
  src: string;
  alt: string;
  caption: string;
  position?: string;
}
```

Do not move image paths into every content record unless the central map becomes an actual maintenance bottleneck. With the current portfolio size, one explicit map is easier to audit.

## Generating a new study

### 1. Start from evidence, not aesthetics

Read the project's public-safe README, ADRs, and approved case-study copy. Write one sentence naming the mechanism the image must explain:

> The image represents **[mechanism]** using **[physical or architectural metaphor]**, with **[one marked decision or boundary]**.

If that sentence needs a product screen, metric, logo, or private artifact to work, choose a safer metaphor.

### 2. Decide whether reuse is correct

Reuse an existing study when the new content explains the same engineering mechanism. Generate a new one only when the concept is materially different. A related article should normally reuse its project's visual.

### 3. Request a constrained SVG study

Use Open Design Cloud or create the SVG directly. A useful generation brief is:

```text
Create one self-contained editorial SVG study for [project or article].
Canvas: viewBox 0 0 1200 760.
Concept: [documented mechanism].
Metaphor: [threshold / ledger / shelves / document planes / routing plan / other].
Style: sparse architectural drawing, flat paper and graphite neutrals,
one rust-red marker, crisp geometry, generous negative space.
Keep the essential mark inside the central crop-safe area.
No gradients, shadows, UI mockups, logos, metrics, people, robots,
brains, neon, external fonts, raster embeds, scripts, or private text.
Return plain editable SVG only.
```

Generate alternatives by changing the metaphor, not by adding visual effects. Select the version that communicates the mechanism fastest at card size.

### 4. Sanitize the export

Before adding the asset:

- keep the `1200 760` viewBox;
- remove generator metadata, scripts, external URLs, embedded rasters, and unused groups;
- remove private filenames, text, identifiers, or prompt fragments;
- preserve simple paths and the restrained palette;
- preview at full detail size and at approximately 200px wide.

Place the final file at:

```text
public/images/editorial/<descriptive-kebab-name>.svg
```

Use a concept name such as `citation-chain.svg`, not a project slug or version like `project-final-v4.svg`.

### 5. Add the mapping

Add one entry to `projectVisuals` in `src/lib/visuals.ts`:

```ts
'new-project-slug': {
  src: '/images/editorial/new-concept.svg',
  alt: 'Concrete description of the visible geometry',
  caption: 'Editorial illustration — <visible geometry>, used for the <Project> case study.',
},
```

For a related article, reuse that entry:

```ts
'new-article-slug': projectVisuals['new-project-slug'],
```

Create a separate article entry only when its argument is visually distinct.

### 6. Write alt text and caption for different jobs

- **Alt text** describes what is visibly drawn. It should still make sense without knowing the project.
- **Caption** names the visible subject and the project/page context, per the template in `docs/content-system.md` — no invented interpretation, provenance, or crop metadata.

Do not repeat the title, begin with "image of," or put critical project evidence only in the image. Decorative marks inside the SVG do not need embedded accessibility text because the route's `<img>` supplies the accessible name.

Caption text for every existing asset already follows the template; re-run the template (Section 2 of `docs/content-system.md`) when a visual is reused in a new context.

## Crop and theme behavior

The same asset appears in several shapes:

- project cards crop near `1.35:1` and become square on small screens;
- featured homepage media crops near `1.25:1`;
- writing intro media crops near `1.45:1`;
- project and article headers crop near `1.35:1`.

Keep the core symbol near the center and treat the outer area as expendable. Use `object-position` only for documentary images that need a deliberate crop; do not patch every SVG with route-specific positioning.

Dark mode reuses the same files. `src/styles/global.css` lowers brightness and saturation for editorial media under `data-theme="dark"`; do not maintain duplicate dark SVGs unless a single asset remains illegible after inspection.

## Validation checklist

For every new or changed image:

1. Confirm the asset exists and the slug mapping resolves to it.
2. Inspect the project card, detail header, and any article reuse.
3. Check desktop and 320–390px mobile crops in light and dark themes.
4. Confirm alt text describes the visible drawing and the caption explains the metaphor.
5. Search the SVG for scripts, external resources, embedded data, and private paths.
6. Run the repository checks.

```bash
rg -n '<script|(?:href|src)="(?:https?://|data:)|/home/|/vault/' public/images/editorial
pnpm lint
pnpm check
pnpm test:content-schema
PUBLIC_PORTFOLIO_STAGE=review pnpm build
pnpm test:e2e
PUBLIC_PORTFOLIO_STAGE=production pnpm build
pnpm test:e2e:production
```

A clean `rg` result is expected for the committed SVG studies. If an external reference is intentional, document and review it rather than weakening the check.

## When to expand the architecture

Keep the explicit map until it causes a demonstrated problem. Consider moving the visual reference into typed content frontmatter only when projects are frequently added by non-code editors or the map becomes difficult to audit. Consider an automated SVG lint step only after asset additions become frequent enough that manual review misses defects.

Do not add a generation API, asset database, theme-specific duplicates, or dynamic image pipeline pre-emptively. Static SVGs plus one mapping file are the current system by design.

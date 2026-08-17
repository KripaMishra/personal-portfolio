# Personal Portfolio

An evidence-first personal portfolio built with Astro and typed MDX content. It presents project case studies, engineering decisions, writing, and verified experience without inventing metrics or exposing private source material.

## Highlights

- Editorial light and dark themes with persisted preference
- Responsive layouts from 320px through wide desktop
- Typed collections for projects, articles, ADRs, challenges, and experience
- Stage-aware publication controls for review and production builds
- Self-hosted Newsreader, Instrument Sans, and IBM Plex Mono fonts
- Purpose-built SVG imagery and accessible, reduced-motion-safe interactions

## Quick start

```bash
pnpm install
pnpm dev
```

Astro serves the development site at `http://localhost:4321` by default.

## Publication stages

The site uses `PUBLIC_PORTFOLIO_STAGE` to keep review drafts out of production.

```bash
# Includes approved content and review drafts
PUBLIC_PORTFOLIO_STAGE=review pnpm build

# Includes approved content only
PUBLIC_PORTFOLIO_STAGE=production pnpm build
```

Development defaults to the review stage. Production deployment must set the stage explicitly.

Visibility and publication rules are documented in [`docs/content-governance.md`](docs/content-governance.md). Visitor-facing copy and captions follow [`docs/content-system.md`](docs/content-system.md).

## Validation

```bash
pnpm lint
pnpm check
pnpm test:content-schema

PUBLIC_PORTFOLIO_STAGE=review pnpm build
pnpm test:e2e

PUBLIC_PORTFOLIO_STAGE=production pnpm build
pnpm test:e2e:production
```

The end-to-end checks cover representative routes at 320, 360, 390, 768, 1024, and 1440px in both themes.

## Repository structure

```text
src/components/       Shared editorial UI
src/content/          Typed portfolio records and writing
src/layouts/          Page shell and document metadata
src/lib/              Content governance and visual mappings
src/pages/            Astro routes
src/scripts/          Theme and scroll-progress behavior
src/styles/           Design tokens and global styles
public/fonts/         Self-hosted typefaces and notices
public/images/        Runtime editorial imagery
content-templates/    Starting points for new content records
scripts/              Schema and browser-layout checks
docs/                 Maintainer and content-governance documentation
```

## Content changes

1. Start from a file in `content-templates/`.
2. Add public-safe evidence links and typed relationships.
3. Keep unsupported claims, private paths, confidential data, and unapproved metrics out of committed content.
4. Run the complete validation sequence before publication.

## Editorial imagery

Project and article visuals use a small symbolic SVG system rather than product mockups or generic AI imagery. Its Open Design Cloud workflow, mapping logic, accessibility contract, generation brief, and future-project checklist are documented in [`docs/EDITORIAL_IMAGES.md`](docs/EDITORIAL_IMAGES.md).

## Continuing development

Read [`docs/AGENT_HANDOVER.md`](docs/AGENT_HANDOVER.md) before changing architecture, content governance, publication stages, or visual direction.

Font attribution and source details are in [`public/fonts/NOTICE.md`](public/fonts/NOTICE.md).

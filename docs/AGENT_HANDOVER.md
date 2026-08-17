# Agent handover

This document is the stable continuation guide for the personal portfolio. Read it before changing content governance, route generation, or the editorial design system.

## Current state

The runnable portfolio is implemented and verified in both publication stages.

- Review build: 17 generated pages, including three review-draft articles.
- Production build: 14 generated pages; review drafts are excluded.
- Responsive matrix: 72 layout checks per stage across six widths and two themes.
- Theme regression check: the real toggle switches to dark, persists through reload, and activates the expected palette.
- Latest verified result: lint, Astro check, schema checks, both builds, and both end-to-end suites passed with zero horizontal overflow.
- No downloadable resume PDF is currently shipped; the Resume page renders the approved timeline copy, and visitor-facing copy follows `docs/content-system.md`.

Do not treat this as publication approval. Review-draft articles and any unresolved disclosure-sensitive claims still require owner approval.

## Product direction

The site is an evidence-first editorial portfolio, not a dashboard.

Preserve:

- Newsreader for display/editorial headings.
- Instrument Sans for interface and body copy.
- IBM Plex Mono only for technical metadata.
- Lotus light as the safe default and a Kanagawa-inspired dark palette (`#16161d` canvas, warm off-white text, coral and blue accents) as a persisted option.
- Route-specific composition, strong typography, meaningful rules, and compact reference rails.
- Symbolic imagery for trust boundaries, redaction, retrieval, memory, citations, evidence approval, documents, and routing.
- Visible keyboard focus, semantic headings, reduced-motion support, and zero overflow at 320px.
- Reader-ready copy in review builds: internal confirmation notes, `review-draft` labels, and unpublished-decision placeholders never render.

Avoid gradients, glass effects, heavy shadows, fake dashboards, generic code screenshots, repetitive cards, oversized headings, vague bordered containers, pill spam, and generic AI imagery.

## Architecture map

| Area | Source |
| --- | --- |
| Collection schemas | `src/content.config.ts` |
| Visibility and relationship validation | `src/lib/content.ts` |
| Visual asset mappings | `src/lib/visuals.ts` |
| Image generation and expansion guide | `docs/EDITORIAL_IMAGES.md` |
| Shared document shell | `src/layouts/BaseLayout.astro` |
| Header, cards, theme, and progress UI | `src/components/` |
| Theme and scroll behavior | `src/scripts/` |
| Design tokens and responsive rules | `src/styles/` |
| Route templates | `src/pages/` |
| Portfolio records | `src/content/` |
| Content starters | `content-templates/` |
| Build and layout checks | `scripts/` |

## Publication model

`PUBLIC_PORTFOLIO_STAGE` accepts `review` or `production`. The application defaults to `review` when the variable is absent.

Visibility is intentional:

- `draft`: validates but has no generated route or index entry.
- `unlisted`: has a direct route but no public index entry.
- `public`: has both a route and index presence.

Article `publicationStatus` is separate:

- `approved`: eligible for production.
- `review-draft`: available only in review builds.

Do not make `unlisted` review-only without first changing the approved contract in `docs/content-governance.md` and its tests.

## Content and disclosure rules

- Derive claims only from public-safe repository documentation, ADRs, and approved evidence.
- Never invent metrics, ownership, employment details, deployment status, or capabilities.
- Do not commit private absolute paths, vault references, confidential identifiers, real user data, logs, or unsupported screenshots.
- Keep `sourceEvidenceNotes` public-safe even though article pages do not render the field.
- Preserve the fail-closed production filter for `review-draft` articles.
- Do not ship a resume PDF or download CTA without owner approval; the canonical resume build stays outside this repository (exact path in internal planning notes only) and never appears in site copy or source.
- Follow `docs/content-system.md` for all visitor-facing copy and captions.
- Keep review-only confirmation notes out of production output.

## Required verification

Run all commands from the repository root:

```bash
pnpm lint
pnpm check
pnpm test:content-schema

PUBLIC_PORTFOLIO_STAGE=review pnpm build
pnpm test:e2e

PUBLIC_PORTFOLIO_STAGE=production pnpm build
pnpm test:e2e:production

# Restore the local review build when continuing content work
PUBLIC_PORTFOLIO_STAGE=review pnpm build
```

Expected baseline:

- Astro check: zero errors, warnings, and hints.
- Content schema: three articles and three experience entries.
- Review build: 17 pages.
- Production build: 14 pages.
- End-to-end checks: the real theme toggle persists after reload, plus 72 successful layout checks per stage across both themes with maximum horizontal overflow `0`.
- Review output: no pending-confirmation queues, internal review labels, or unpublished-decision placeholders.
- Production output: no review-draft routes, draft references, or private absolute paths.

Counts may legitimately change when approved content is added. Update assertions and this handover in the same change.

## Safe continuation workflow

1. Read `README.md`, `docs/content-governance.md`, `docs/content-system.md`, and `docs/EDITORIAL_IMAGES.md` when the task touches media or copy.
2. Inspect the exact route, collection, and shared helpers affected by the task.
3. Reuse existing components, tokens, and visual mappings before adding abstractions.
4. Make the smallest coherent change.
5. Run targeted checks, then the complete stage matrix above.
6. Audit `dist/` for review-only copy and private paths before calling production ready.
7. Update this handover when architecture, commands, publication rules, or known risks change.

## Local-only material

Do not commit local planning packs, `.pi-subagents/` output, QA captures, temporary browser harnesses, generated `dist/`, or continuation-session logs unless the owner explicitly requests them. Runtime files under `public/fonts/` and `public/images/` are required and should remain tracked.

## Remaining approval gates

- Promote review-draft articles only after owner and disclosure review.
- Confirm any new employer, ownership, metric, or deployment claims before publication.
- Add deployment instructions only after a target platform is chosen and verified.
- Owner decided on 2026-08-18 to hold the resume download: no PDF asset or download CTA ships for now (the earlier as-is approval was superseded); resume copy stays evidence-backed and plain.

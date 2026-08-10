# Agent handover

This document is the stable continuation guide for the personal portfolio. Read it before changing content governance, route generation, or the editorial design system.

## Current state

The runnable portfolio is implemented and verified in both publication stages.

- Review build: 19 generated pages, including four review-draft articles.
- Production build: 15 generated pages; review drafts are excluded.
- Responsive matrix: 72 layout checks per stage across six widths and two themes.
- Latest verified result: lint, Astro check, schema checks, both builds, and both end-to-end suites passed with zero horizontal overflow.

Do not treat this as publication approval. Review-draft articles and any unresolved disclosure-sensitive claims still require owner approval.

## Product direction

The site is an evidence-first editorial portfolio, not a dashboard.

Preserve:

- Newsreader for display/editorial headings.
- Instrument Sans for interface and body copy.
- IBM Plex Mono only for technical metadata.
- Lotus light as the safe default and near-black dark as a persisted option.
- Route-specific composition, strong typography, meaningful rules, and compact reference rails.
- Symbolic imagery for trust boundaries, redaction, retrieval, memory, citations, evidence approval, documents, and routing.
- Visible keyboard focus, semantic headings, reduced-motion support, and zero overflow at 320px.

Avoid gradients, glass effects, heavy shadows, fake dashboards, generic code screenshots, repetitive cards, oversized headings, vague bordered containers, pill spam, and generic AI imagery.

## Architecture map

| Area | Source |
| --- | --- |
| Collection schemas | `src/content.config.ts` |
| Visibility and relationship validation | `src/lib/content.ts` |
| Visual asset mappings | `src/lib/visuals.ts` |
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
- Do not add a resume PDF, deployment configuration, or SSI ownership/deployment claims without explicit approval.
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
- Content schema: four articles and three experience entries.
- Review build: 19 pages.
- Production build: 15 pages.
- End-to-end checks: 72 successful layout checks per stage, both themes, maximum horizontal overflow `0`.
- Production output: no review-draft routes, draft references, confirmation queue, or private absolute paths.

Counts may legitimately change when approved content is added. Update assertions and this handover in the same change.

## Safe continuation workflow

1. Read `README.md` and `docs/content-governance.md`.
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

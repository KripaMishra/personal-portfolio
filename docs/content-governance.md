# Content governance

## Purpose

This repository stores portfolio content as typed MDX so every public claim can be reviewed in git before it appears on the site.

## Visitor-facing copy contract

Visitor-facing copy must follow [`docs/content-system.md`](content-system.md): every section states its
audience, value, and action; captions identify subject and context without invented interpretation;
undefined metaphors, process meta copy, and unbacked metrics are banned. That document is the
author/reviewer checklist for copy changes.

## Visibility rules

- `draft`: validates in the repository but never appears in production route generation or indexes.
- `unlisted`: receives a route for private review but stays out of public indexes.
- `public`: appears in route generation and index surfaces.

## Project metadata requirements

- Every project must declare exactly one lifecycle state: `in-development`, `iterating`, `complete`, or `archived`.
- `stateSince` is required for lifecycle evidence on every project.
- `public` and `unlisted` projects must include at least one public evidence source through `sourceLinks`, `liveUrl`, or `releaseUrl`.
- `liveUrl` requires `liveUrlCheckedOn`.
- `releaseUrl` requires `releaseLabel`.

## Relationship rules

- Articles reference related project slugs through typed collection references.
- ADRs and challenges must reference at least one project slug.
- Public related-content surfaces only render entries with `visibility: public`.
- Public projects cannot reference draft or unlisted related articles, ADRs, or challenges.
- Public articles cannot reference draft or unlisted related projects.
- Related content appears newest-first on project detail pages.

## Editorial guardrails

- No private health-product details, confidential metrics, or unapproved ownership claims.
- `publicationStatus` controls route generation but must not render as a reader-facing label.
- Unresolved confirmation prompts belong in local planning, not tracked content records or rendered pages.
- Planned decision slots stay out of the page until a public ADR exists.
- Use concise factual empty states instead of publishing unfinished narratives.
- Validate every change with `pnpm check` before review.

## Template usage

- Start from the files in `content-templates/`.
- Keep frontmatter factual, concise, and public-safe.
- Run `pnpm check`, `pnpm lint`, `pnpm build`, and `pnpm test:e2e` before requesting review.
- Project bodies must use the exact approved section set and naming: `Context`, `Problem`, `Constraints`, `Approach`, `Evidence`, `Decisions`, `Challenges`, `Outcome / current state`, `Next`.

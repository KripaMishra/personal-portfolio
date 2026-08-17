# Portfolio content system

This document is the durable contract for visitor-facing copy in this repository. It defines what
every section must do, how captions are written, which word patterns are banned, what counts as
evidence, and how an author or reviewer checks a change. Changes that touch visitor copy must conform
to it. It is the companion to `docs/content-governance.md` (schema and visibility rules),
`docs/EDITORIAL_IMAGES.md` (how assets are produced), and `docs/AGENT_HANDOVER.md` (build and stage
contract).

## 1. Section objectives — audience, value, action

Every rendered section must state who it is for and why it matters before its copy is accepted.
Where the section has a destination, it must also name one concrete next action.

1. **Audience** — who is reading this section (one clause).
2. **Value** — why the visitor should care (one factual sentence).
3. **Action (where relevant)** — what the visitor can inspect or do next (one verb and a named
   destination). Required whenever the section leads somewhere; purely informational sections
   (for example the Work rail) record "(informational)" and need no action.

If audience or value is missing, or a destination-bearing section lacks an action, the copy is
not done.

| Route / section | Audience | Value | Action |
| --- | --- | --- | --- |
| Home · hero | First-visit evaluators | A 5-second read on who the author is and what the portfolio records | Enter the work index (`/work`) |
| Home · selected work | Evaluators | Scoped projects with a current state in one glance | Open one case study |
| Home · current focus | Recruiters without portfolio context | The concrete subjects of the work, each backed by a record | Read the work index (`/work`) |
| Home · writing | Technical collaborators | What the notes contain and why they are trustworthy | Read an article card |
| Home · resume CTA | Recruiters needing chronology | A verified, plain timeline | Open the timeline (`/resume`) |
| Work · hero | Evaluators | What the index holds and how to read it | Scroll the lifecycle groups |
| Work · rail | Evaluators | Lifecycle summary at a glance | (informational) |
| Work · featured | Evaluators | Records with enough public documentation for a full case study | Read a detail page |
| Work · experiments | Curious readers | Working public code with lighter documentation | Open the repository link on a card |
| Resume · hero | Recruiters | A verified, plain chronology | Read the timeline |
| Writing · hero / index | Collaborators | How articles are grounded in public records | Read an article |

## 2. Factual caption template

Captions state the visible subject, the project or page context, and one factual relevance clause
that ties the visual to where it appears — without invented interpretation.

```
Editorial illustration/photograph — <what the visual actually shows>, used for <project or page>, which <one factual clause from the owning record>.
```

Rules:

- **Subject** is the concrete thing in the image, taken from the asset's alt text — never
  re-interpreted.
- **Context** is the project slug or route the visual belongs to, verifiable from this repository.
- **Relevance** is one clause grounded in the owning record (project `summary`/`currentState`,
  the article's own lead, or the public README it mirrors) connecting the visual's subject to
  that context. It states what the record documents, never what the image "means". Where a
  figure genuinely serves no single record (an article fallback), the clause names that role
  plainly.
- No claims about meaning ("a threshold makes the handoff visible"), no drama ("fail-closed"),
  no provenance or build metadata ("from the project archive", "Hero crop 4:5").
- Captions live in `src/lib/visuals.ts` for project/article figures and inline in route templates
  only where the figure is route-specific (`src/pages/writing.astro`).

Worked examples (current values):

| Asset | Caption |
| --- | --- |
| `trust-boundary.svg` | Editorial illustration — a threshold with one red handoff marker, used for the Career Copilot case study, which documents a single-owner agent with a bounded /save flow. |
| `redaction-study.svg` | Editorial illustration — a document with sensitive lines obscured, used for the mastra-pii case study, which provides PII redaction with a deterministic fail-closed fallback. |
| `retrieval-shelves.svg` | Editorial illustration — shelving geometry, used for the DocNeedle case study, which indexes documentation locally with SQLite FTS5. |
| `evidence-ledger.svg` | Editorial illustration — a ruled ledger with one separated line, used for the Sales Intelligence Agent case study, which keeps repository evidence distinct from deployment claims. |
| `routing-plan.svg` | Editorial illustration — a routing plan with three handoff points, used for the Scavenger case study, which routes one-shot AI tasks across free-tier providers. |
| `approval-desk.svg` (article) | Editorial illustration — an approval desk with a checked document, used for the "Separate the product surface from the benchmark harness" article, which reviews product surface and evaluation evidence as separate artifacts. |
| `engineering-notes.webp` (hero) | Editorial photograph — engineering notes and system diagrams arranged on a desk. (Not rendered as a figcaption; the hero uses an overlay stamp instead.) |

## 3. Banned vague patterns

The following patterns must not appear in section headers, leads, or CTAs. A content-schema
review should `rg` for them before sign-off, then confirm each hit is inside an article or
project body and covered by an exemption.

- Undefined metaphors in headers, leads, and CTAs: "edge", "atmosphere", "claim cloud",
  "the note behind the decision", "the happy path". (Exemption: article and project bodies may
  use these terms when they are defined in the text or quoted from the public README/ADR — for
  example "the happy path" as a technical term in an article about error handling, or the
  trusted-ingress article's verbatim README quotes.)
- Jargon without a definition or referent in headers, leads, and CTAs: "guided onboarding",
  "structured job review", "earns its space", "visible decisions". (Exemption: article and
  project bodies may quote the public README's implemented-features list verbatim, as in the
  trusted-ingress article.)
- Relative-evidence phrases with no concrete referent in headers, leads, and CTAs: "thinner
  evidence", "smaller claims". (Exemption: article and project bodies that define the
  referent.)
- Process or meta copy leaking into the UI: "Claims scoped to public sources", "Hero crop 4:5",
  "from the project archive".
- Hardcoded counts in prose that drift with content ("Five projects…", "Three roles…"). Prefer
  data-driven counts (the work rail already renders `All work · N` from data) or count-free
  phrasing.
- A metric without its linked source. Metrics that appear must already exist in a tracked content
  record (`src/content/**`) or in the approved public resume timeline.

## 4. Evidence rules

- Every factual clause in visitor copy traces to a tracked content record (`src/content/**`), a
  published ADR, or the approved public resume timeline.
- New claims require a `sourceLinks` / `evidenceLinks` entry in the owning record in the same change.
- Never invent metrics, ownership, employment details, deployment status, or capabilities.
- Never expose machine-local paths, vault paths, personal contact details beyond what the public
  resume timeline already publishes, real user data, or private conversation content.
- No downloadable resume asset is shipped without owner approval. The canonical resume build
  stays outside this repository (exact path in internal planning notes only) and never appears in
  site copy, source, or committed docs.
- Review-build-only copy (confirmation prompts, `review-draft` labels) never renders; see
  `docs/content-governance.md`.

## 5. Author / reviewer checklist

For every content change:

- [ ] Every section changed passes the audience/value/action test (Section 1).
- [ ] Every changed caption follows the template (Section 2) and matches its alt text.
- [ ] `rg` over `src/` finds no Section 3 patterns in the changed copy.
- [ ] Each factual clause is traceable (Section 4); new claims carry an evidence link.
- [ ] No machine-local paths, vault paths, or unapproved contact details were added.
- [ ] No downloadable resume asset is shipped without owner approval (see Section 4).
- [ ] Gates pass: `pnpm lint`, `pnpm check`, `pnpm test:content-schema`, review build + `pnpm test:e2e`,
      production build + `pnpm test:e2e:production`.
- [ ] Browser check at 1440px and 390px in light and dark themes for the changed routes, including
      the resume download link resolving (HTTP 200 on the PDF path).
export interface EditorialVisual {
  src: string;
  alt: string;
  caption: string;
  position?: string;
}

const projectVisuals: Record<string, EditorialVisual> = {
  'career-copilot': {
    src: '/images/editorial/trust-boundary.svg',
    alt: 'Architectural threshold with a single red handoff marker',
    caption: 'Editorial illustration — a threshold with one red handoff marker, used for the Career Copilot case study, which documents a single-owner agent with a bounded /save flow.',
  },
  'mastra-pii': {
    src: '/images/editorial/redaction-study.svg',
    alt: 'Synthetic document study with sensitive lines obscured',
    caption: 'Editorial illustration — a document with sensitive lines obscured, used for the mastra-pii case study, which provides PII redaction with a deterministic fail-closed fallback.',
  },
  docneedle: {
    src: '/images/editorial/retrieval-shelves.svg',
    alt: 'Architectural shelving geometry representing indexed documentation',
    caption: 'Editorial illustration — shelving geometry, used for the DocNeedle case study, which indexes documentation locally with SQLite FTS5.',
  },
  'ssi-sales-intelligence-agent': {
    src: '/images/editorial/evidence-ledger.svg',
    alt: 'Ruled evidence ledger with completed marks and one separated boundary line',
    caption: 'Editorial illustration — a ruled ledger with one separated line, used for the Sales Intelligence Agent case study, which keeps repository evidence distinct from deployment claims.',
  },
  scavenger: {
    src: '/images/editorial/routing-plan.svg',
    alt: 'Architectural routing plan with three explicit handoff points',
    caption: 'Editorial illustration — a routing plan with three handoff points, used for the Scavenger case study, which routes one-shot AI tasks across free-tier providers.',
  },
};

const articleVisuals: Record<string, EditorialVisual> = {
  'trusted-ingress-before-more-tools': projectVisuals['career-copilot'],
  'eval-harness-for-a-user-facing-agent': projectVisuals['career-copilot'],
  'reliable-pii-redaction-for-modern-agents': projectVisuals['mastra-pii'],
  'separate-product-surface-from-benchmark-harnesses': {
    src: '/images/editorial/approval-desk.svg',
    alt: 'Synthetic approval desk with a checked document',
    caption: 'Editorial illustration — an approval desk with a checked document, used for the “Separate the product surface from the benchmark harness” article, which reviews product surface and evaluation evidence as separate artifacts.',
  },
};

export const heroVisual: EditorialVisual = {
  src: '/images/engineering-notes.webp',
  alt: 'Engineering notes and system diagrams arranged on a desk',
  caption: 'Editorial photograph — engineering notes and system diagrams arranged on a desk.',
  position: '60% center',
};

export function getProjectVisual(slug: string): EditorialVisual {
  return projectVisuals[slug] ?? projectVisuals.docneedle;
}

export function getArticleVisual(slug: string): EditorialVisual {
  return articleVisuals[slug] ?? {
    src: '/images/editorial/approval-desk.svg',
    alt: 'Synthetic approval desk with a checked document',
    caption: 'Editorial illustration — an approval desk with a checked document, used for article figures without a dedicated visual.',
  };
}

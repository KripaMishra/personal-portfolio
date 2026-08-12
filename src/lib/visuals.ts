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
    caption: 'Trusted ingress — a threshold makes the handoff visible.',
  },
  'mastra-pii': {
    src: '/images/editorial/redaction-study.svg',
    alt: 'Synthetic document study with sensitive lines obscured',
    caption: 'Fail-closed redaction — structure remains while content is withheld.',
  },
  docneedle: {
    src: '/images/editorial/retrieval-shelves.svg',
    alt: 'Architectural shelving geometry representing indexed documentation',
    caption: 'Local retrieval — shelves as navigable document space.',
  },
  'cuda-documentation-copilot': {
    src: '/images/editorial/citation-chain.svg',
    alt: 'Three document planes connected to marked source references',
    caption: 'Citation-first retrieval — every answer keeps a route back to source.',
  },
  'ssi-sales-intelligence-agent': {
    src: '/images/editorial/evidence-ledger.svg',
    alt: 'Ruled evidence ledger with completed marks and one separated boundary line',
    caption: 'Evidence boundary — repository visibility is not proof of deployment ownership.',
  },
  scavenger: {
    src: '/images/editorial/routing-plan.svg',
    alt: 'Architectural routing plan with three explicit handoff points',
    caption: 'Task routing — the path is explicit, not implied.',
  },
};

const articleVisuals: Record<string, EditorialVisual> = {
  'trusted-ingress-before-more-tools': projectVisuals['career-copilot'],
  'reliable-pii-redaction-for-modern-agents': projectVisuals['mastra-pii'],
  'separate-product-surface-from-benchmark-harnesses': {
    src: '/images/editorial/approval-desk.svg',
    alt: 'Synthetic approval desk with a checked document',
    caption: 'Product surface and evaluation evidence are reviewed as separate artifacts.',
  },
  'citation-first-rag-needs-an-insufficient-context-path': projectVisuals['cuda-documentation-copilot'],
};

export const heroVisual: EditorialVisual = {
  src: '/images/engineering-notes.webp',
  alt: 'Engineering notes and system diagrams arranged on a desk',
  caption: 'Documentary desk study from the project archive.',
  position: '60% center',
};

export function getProjectVisual(slug: string): EditorialVisual {
  return projectVisuals[slug] ?? projectVisuals.docneedle;
}

export function getArticleVisual(slug: string): EditorialVisual {
  return articleVisuals[slug] ?? {
    src: '/images/editorial/approval-desk.svg',
    alt: 'Synthetic approval desk with a checked document',
    caption: 'Evidence is reviewed before a claim travels.',
  };
}

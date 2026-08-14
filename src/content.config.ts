import { defineCollection, reference, z } from 'astro:content';

const visibilitySchema = z.enum(['draft', 'unlisted', 'public']).default('draft');
const lifecycleSchema = z.enum(['in-development', 'iterating', 'complete', 'archived']);
const linkKindSchema = z.enum(['source', 'demo', 'docs', 'release', 'article', 'other']);
const badgeSchema = z.enum(['deployed', 'versioned', 'open-source', 'case-study', 'writing', 'experimental']);
const publicationStatusSchema = z.enum(['approved', 'review-draft']).default('approved');

const externalLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  kind: linkKindSchema.default('other'),
});

const decisionSlotSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(['published', 'planned']),
  adrRef: reference('adrs').optional(),
});

const projectCollection = defineCollection({
  type: 'content',
  schema: z
    .object({
      title: z.string().min(1),
      summary: z.string().min(1),
      visibility: visibilitySchema,
      featured: z.boolean().default(false),
      order: z.number().int().nonnegative().default(999),
      lifecycle: lifecycleSchema,
      stateSince: z.date(),
      currentState: z.string().min(1),
      problem: z.string().min(1).optional(),
      constraints: z.array(z.string().min(1)).default([]),
      approach: z.array(z.string().min(1)).default([]),
      outcomes: z.array(z.string().min(1)).default([]),
      domains: z.array(z.string().min(1)).default([]),
      tags: z.array(z.string().min(1)).default([]),
      techStack: z.array(z.string().min(1)).default([]),
      badges: z.array(badgeSchema).default([]),
      sourceLinks: z.array(externalLinkSchema).default([]),
      liveUrl: z.string().url().optional(),
      liveUrlCheckedOn: z.date().optional(),
      releaseUrl: z.string().url().optional(),
      releaseLabel: z.string().min(1).optional(),
      articleRefs: z.array(reference('articles')).default([]),
      adrRefs: z.array(reference('adrs')).default([]),
      challengeRefs: z.array(reference('challenges')).default([]),
      decisionSlots: z.array(decisionSlotSchema).default([]),
    })
    .superRefine((value, context) => {
      if (value.liveUrl && !value.liveUrlCheckedOn) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['liveUrlCheckedOn'],
          message: 'liveUrlCheckedOn is required when liveUrl is set.',
        });
      }

      if (!value.liveUrl && value.liveUrlCheckedOn) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['liveUrl'],
          message: 'liveUrl is required when liveUrlCheckedOn is set.',
        });
      }

      if (value.releaseUrl && !value.releaseLabel) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['releaseLabel'],
          message: 'releaseLabel is required when releaseUrl is set.',
        });
      }

      if (!value.releaseUrl && value.releaseLabel) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['releaseUrl'],
          message: 'releaseUrl is required when releaseLabel is set.',
        });
      }

      for (const [index, slot] of value.decisionSlots.entries()) {
        if (slot.status === 'published' && !slot.adrRef) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['decisionSlots', index, 'adrRef'],
            message: 'Published decision slots require an adrRef.',
          });
        }

        if (slot.status === 'planned' && slot.adrRef) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['decisionSlots', index, 'adrRef'],
            message: 'Planned decision slots cannot point at a published ADR.',
          });
        }
      }

      if (value.visibility !== 'draft') {
        const evidenceCount = value.sourceLinks.length + (value.liveUrl ? 1 : 0) + (value.releaseUrl ? 1 : 0);

        if (evidenceCount === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sourceLinks'],
            message: 'Public and unlisted projects require at least one evidence link, live URL, or release URL.',
          });
        }
      }
    }),
});

const articleCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    deck: z.string().min(1).optional(),
    visibility: visibilitySchema,
    publicationStatus: publicationStatusSchema,
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    topics: z.array(z.string().min(1)).default([]),
    relatedProjects: z.array(reference('projects')).default([]),
    evidenceLinks: z.array(externalLinkSchema).default([]),
    sourceEvidenceNotes: z.array(z.string().min(1)).default([]),
    disclosureCaveats: z.array(z.string().min(1)).default([]),
  }),
});

const adrCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    visibility: visibilitySchema,
    decidedAt: z.date(),
    projectRefs: z.array(reference('projects')).min(1),
    decision: z.string().min(1),
    status: z.enum(['proposed', 'accepted', 'superseded']),
    evidenceLinks: z.array(externalLinkSchema).default([]),
  }),
});

const challengeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    visibility: visibilitySchema,
    encounteredAt: z.date(),
    projectRefs: z.array(reference('projects')).min(1),
    challenge: z.string().min(1),
    response: z.string().min(1),
    evidenceLinks: z.array(externalLinkSchema).default([]),
  }),
});

const experienceCollection = defineCollection({
  type: 'content',
  schema: z.object({
    organization: z.string().min(1),
    role: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    order: z.number().int().nonnegative().default(999),
    summary: z.string().min(1),
    transitionNote: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    employmentType: z.string().min(1).optional(),
    highlights: z.array(z.string().min(1)).min(1),
    skills: z.array(z.string().min(1)).default([]),
    relatedProjects: z.array(reference('projects')).default([]),
    relatedWriting: z.array(reference('articles')).default([]),
    verificationSources: z.array(z.string().min(1)).min(1),
    publicationStatus: publicationStatusSchema,
  }),
});

const assetsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    alt: z.string().optional(),
  }),
});

export const collections = {
  projects: projectCollection,
  articles: articleCollection,
  adrs: adrCollection,
  challenges: challengeCollection,
  experience: experienceCollection,
  assets: assetsCollection,
};

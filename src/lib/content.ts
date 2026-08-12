import { getCollection, type CollectionEntry } from 'astro:content';

export type Visibility = 'draft' | 'unlisted' | 'public';
export type SiteStage = 'review' | 'production';

type SortableDate = Date | string;

const stageFromEnv = import.meta.env.PUBLIC_PORTFOLIO_STAGE;

export const siteStage: SiteStage = stageFromEnv === 'production' ? 'production' : 'review';
export const isReviewStage = siteStage === 'review';

export const formatDate = (value: SortableDate) =>
  new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

export const isIndexVisible = (visibility: Visibility) => visibility === 'public';
export const isRoutable = (visibility: Visibility) => visibility !== 'draft';

const isPublicationVisible = (publicationStatus: 'approved' | 'review-draft') =>
  publicationStatus === 'approved' || isReviewStage;

const normalizeContentId = (value: string) => value.replace(/\.(md|mdx)$/, '');

let contentGovernanceChecked = false;

export const filterIndexVisibleEntries = <
  T extends 'projects' | 'articles' | 'adrs' | 'challenges',
>(entries: CollectionEntry<T>[]) =>
  entries.filter((entry) => {
    if (!isIndexVisible(entry.data.visibility)) {
      return false;
    }

    if ('publicationStatus' in entry.data) {
      return isPublicationVisible(entry.data.publicationStatus as 'approved' | 'review-draft');
    }

    return true;
  });

const getPublicEntryIds = <T extends 'projects' | 'articles' | 'adrs' | 'challenges'>(
  entries: CollectionEntry<T>[],
) => new Set(filterIndexVisibleEntries(entries).map((entry) => normalizeContentId(entry.id)));

const appendVisibilityIssues = (
  issues: string[],
  owner: string,
  field: string,
  references: { id: string }[],
  allowedIds: Set<string>,
) => {
  for (const reference of references) {
    if (!allowedIds.has(normalizeContentId(reference.id))) {
      issues.push(`${owner} -> ${field} references non-public entry "${reference.id}".`);
    }
  }
};

export const assertPublicRelationshipVisibility = async () => {
  if (contentGovernanceChecked) {
    return;
  }

  const projects = await getCollection('projects');
  const articles = await getCollection('articles');
  const adrs = await getCollection('adrs');
  const challenges = await getCollection('challenges');

  const publicProjectIds = getPublicEntryIds(projects);
  const publicArticleIds = getPublicEntryIds(articles);
  const stageHiddenArticleIds = new Set(
    articles
      .filter(
        (entry) =>
          isIndexVisible(entry.data.visibility) && !isPublicationVisible(entry.data.publicationStatus),
      )
      .map((entry) => normalizeContentId(entry.id)),
  );
  const publicAdrIds = getPublicEntryIds(adrs);
  const publicChallengeIds = getPublicEntryIds(challenges);

  const issues: string[] = [];

  const publicProjects: CollectionEntry<'projects'>[] = projects.filter((entry) =>
    isIndexVisible(entry.data.visibility),
  );
  const publicArticles = filterIndexVisibleEntries<'articles'>(articles);

  for (const project of publicProjects) {
    appendVisibilityIssues(
      issues,
      `project:${project.id}`,
      'articleRefs',
      project.data.articleRefs.filter(
        (reference) => !stageHiddenArticleIds.has(normalizeContentId(reference.id)),
      ),
      publicArticleIds,
    );
    appendVisibilityIssues(issues, `project:${project.id}`, 'adrRefs', project.data.adrRefs, publicAdrIds);
    appendVisibilityIssues(
      issues,
      `project:${project.id}`,
      'challengeRefs',
      project.data.challengeRefs,
      publicChallengeIds,
    );

    for (const slot of project.data.decisionSlots) {
      if (slot.adrRef && !publicAdrIds.has(normalizeContentId(slot.adrRef.id))) {
        issues.push(`project:${project.id} -> decisionSlots references non-public ADR "${slot.adrRef.id}".`);
      }
    }
  }

  for (const article of publicArticles) {
    appendVisibilityIssues(
      issues,
      `article:${article.id}`,
      'relatedProjects',
      article.data.relatedProjects,
      publicProjectIds,
    );
  }

  if (issues.length > 0) {
    throw new Error(
      ['Public content can only reference related entries with visibility="public".', ...issues].join('\n'),
    );
  }

  contentGovernanceChecked = true;
};

const byDateDesc = (left: SortableDate, right: SortableDate) =>
  new Date(right).getTime() - new Date(left).getTime();

const byProjectPriority = (
  left: CollectionEntry<'projects'>,
  right: CollectionEntry<'projects'>,
) => {
  if (left.data.order !== right.data.order) {
    return left.data.order - right.data.order;
  }

  return byDateDesc(left.data.stateSince, right.data.stateSince);
};

export const getProjects = async () => {
  await assertPublicRelationshipVisibility();
  const entries = await getCollection('projects');
  return entries.sort(byProjectPriority);
};

export const getPublicProjects = async () => {
  const entries = await getProjects();
  return entries.filter((entry) => isIndexVisible(entry.data.visibility));
};

export const getRoutableProjects = async () => {
  const entries = await getProjects();
  return entries.filter((entry) => isRoutable(entry.data.visibility));
};

export const getArticles = async () => {
  await assertPublicRelationshipVisibility();
  const entries = await getCollection('articles');
  return entries
    .filter((entry) => isPublicationVisible(entry.data.publicationStatus))
    .sort((left, right) => byDateDesc(left.data.publishedAt, right.data.publishedAt));
};

export const getPublicArticles = async () => {
  const entries = await getArticles();
  return entries.filter((entry) => isIndexVisible(entry.data.visibility));
};

export const getRoutableArticles = async () => {
  const entries = await getArticles();
  return entries.filter((entry) => isRoutable(entry.data.visibility));
};

export const getExperienceEntries = async () => {
  const entries = (await getCollection('experience')) as CollectionEntry<'experience'>[];
  return entries
    .filter((entry) => isPublicationVisible(entry.data.publicationStatus))
    .sort((left, right) => left.data.order - right.data.order);
};

export const getRelatedAdrs = async (projectId: string) => {
  await assertPublicRelationshipVisibility();
  const entries = await getCollection('adrs');
  return entries
    .filter(
      (entry) =>
        isIndexVisible(entry.data.visibility) &&
        entry.data.projectRefs.some((reference) => reference.id === projectId),
    )
    .sort((left, right) => byDateDesc(left.data.decidedAt, right.data.decidedAt));
};

export const inlineMarkdownLinks = (text: string): string =>
  text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer" target="_blank">$1</a>');

export const stripMarkdownLinks = (text: string): string => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

export const getRelatedChallenges = async (projectId: string) => {
  await assertPublicRelationshipVisibility();
  const entries = await getCollection('challenges');
  return entries
    .filter(
      (entry) =>
        isIndexVisible(entry.data.visibility) &&
        entry.data.projectRefs.some((reference) => reference.id === projectId),
    )
    .sort((left, right) => byDateDesc(left.data.encounteredAt, right.data.encounteredAt));
};

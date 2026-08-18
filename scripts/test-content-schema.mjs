/* global process, console */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const articleFiles = [
  'src/content/articles/trusted-ingress-before-more-tools.mdx',
  'src/content/articles/reliable-pii-redaction-for-modern-agents.mdx',
  'src/content/articles/separate-product-surface-from-benchmark-harnesses.mdx',
  'src/content/articles/how-we-test-an-ai-agent-that-saves-your-jobs.mdx',
];

const experienceFiles = [
  'src/content/experience/taphealth-ai-engineer.mdx',
  'src/content/experience/taphealth-ai-engineer-intern.mdx',
  'src/content/experience/vlippr-data-science-intern.mdx',
];

const placeholderArticle = 'src/content/articles/portfolio-editorial-workflow-draft.mdx';

const readFrontmatter = (relativePath) => {
  const content = readFileSync(resolve(root, relativePath), 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  assert.ok(match, `${relativePath} should include frontmatter.`);

  return match[1];
};

const hasListField = (frontmatter, fieldName) =>
  new RegExp(`^${fieldName}:\\n(?:  - .+\\n?)+`, 'm').test(frontmatter);

assert.ok(!existsSync(resolve(root, placeholderArticle)), 'Placeholder article content should be removed from src/content/articles.');

for (const relativePath of articleFiles) {
  const frontmatter = readFrontmatter(relativePath);

  assert.match(frontmatter, /^visibility: public$/m, `${relativePath} should stay publicly routable in review mode.`);
  assert.match(frontmatter, /^publicationStatus: review-draft$/m, `${relativePath} should remain review-draft until approval.`);
  assert.doesNotMatch(frontmatter, /^reviewLabel:/m, `${relativePath} should not carry a reader-facing review label.`);
  assert.ok(hasListField(frontmatter, 'relatedProjects'), `${relativePath} should keep typed related project references.`);
  assert.ok(hasListField(frontmatter, 'evidenceLinks'), `${relativePath} should record evidence links.`);
  assert.ok(hasListField(frontmatter, 'sourceEvidenceNotes'), `${relativePath} should record source evidence notes.`);
  assert.ok(hasListField(frontmatter, 'disclosureCaveats'), `${relativePath} should record disclosure caveats.`);
}

for (const relativePath of experienceFiles) {
  const frontmatter = readFrontmatter(relativePath);

  assert.match(frontmatter, /^organization: .+$/m, `${relativePath} should declare an organization.`);
  assert.match(frontmatter, /^role: .+$/m, `${relativePath} should declare a role.`);
  assert.match(frontmatter, /^publicationStatus: approved$/m, `${relativePath} should stay visible on the resume route.`);
  assert.ok(hasListField(frontmatter, 'highlights'), `${relativePath} should declare evidence-backed highlights.`);
  assert.ok(hasListField(frontmatter, 'skills'), `${relativePath} should declare skills used.`);
  assert.ok(hasListField(frontmatter, 'verificationSources'), `${relativePath} should include verification sources.`);
  assert.doesNotMatch(frontmatter, /^needsConfirmation:/m, `${relativePath} should have no unresolved confirmation field.`);
}

console.log(`Content schema checks passed for ${articleFiles.length} articles and ${experienceFiles.length} experience entries.`);

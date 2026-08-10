/* global process, console, URL */

import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

const runFile = promisify(execFile);
const stage = process.argv[2];

if (stage !== 'review' && stage !== 'production') {
  throw new Error('Usage: node scripts/test-e2e.mjs <review|production>');
}

const root = process.cwd();
const distDir = resolve(root, 'dist');
const artifactsDir = resolve(root, 'artifacts/qa');
const harnessPath = resolve(distDir, '__layout-check__.html');
const chromiumCandidates = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
const articleSlugs = [
  'trusted-ingress-before-more-tools',
  'fail-closed-redaction-foundation',
  'separate-product-surface-from-benchmark-harnesses',
  'citation-first-rag-needs-an-insufficient-context-path',
];
const projectSlugs = [
  'career-copilot',
  'mastra-pii',
  'docneedle',
  'cuda-documentation-copilot',
  'ssi-sales-intelligence-agent',
  'scavenger',
];
const commonPages = [
  'index.html',
  'work/index.html',
  'writing/index.html',
  'resume/index.html',
  'about/index.html',
  'now/index.html',
  '404.html',
  ...projectSlugs.map((slug) => `work/${slug}/index.html`),
  'work/career-copilot/decisions/context-memory-boundary/index.html',
  'work/mastra-pii/decisions/sensitive-data-boundary/index.html',
];
const reviewArticlePages = articleSlugs.map((slug) => `writing/${slug}/index.html`);
const requiredPages = stage === 'review' ? [...commonPages, ...reviewArticlePages] : commonPages;
const layoutPaths = [
  '/',
  '/resume',
  '/writing',
  stage === 'review' ? '/writing/trusted-ingress-before-more-tools' : '/work',
  '/work/career-copilot',
  '/work/career-copilot/decisions/context-memory-boundary',
];

for (const relativePath of requiredPages) {
  if (!existsSync(resolve(distDir, relativePath))) {
    throw new Error(`Missing build artifact: dist/${relativePath}. Build the ${stage} stage before testing it.`);
  }
}

if (stage === 'production') {
  for (const relativePath of reviewArticlePages) {
    if (existsSync(resolve(distDir, relativePath))) {
      throw new Error(`Production must omit review-only artifact: dist/${relativePath}.`);
    }
  }
}

const readPage = (relativePath) => readFileSync(resolve(distDir, relativePath), 'utf8');
const indexHtml = readPage('index.html');
const aboutHtml = readPage('about/index.html');
const writingHtml = readPage('writing/index.html');
const resumeHtml = readPage('resume/index.html');
const careerCopilotHtml = readPage('work/career-copilot/index.html');
const docNeedleHtml = readPage('work/docneedle/index.html');
const projectHtml = projectSlugs.map((slug) => readPage(`work/${slug}/index.html`)).join('\n');
const singleLinkSurface = (html, href) => {
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (html.match(new RegExp(`href="${escapedHref}"`, 'g'))?.length ?? 0) === 1;
};
const assertions = [
  [indexHtml.includes('Kripa Shankar Mishra') && !indexHtml.includes('Kripa Patel'), 'Home should render the approved owner name.'],
  [indexHtml.includes('data-site-header-content') && indexHtml.includes('data-scroll-progress-shell') && indexHtml.includes('role="group"') && indexHtml.includes('aria-label="Page progress"'), 'Home should expose accessible header and progress hooks.'],
  [indexHtml.includes('href="/work"') && indexHtml.includes('Browse all work from the process visual'), 'Hero visual should have an accessible /work destination.'],
  [singleLinkSurface(indexHtml, '/work/career-copilot'), 'Featured Career Copilot content should have one link surface.'],
  [singleLinkSurface(indexHtml, '/work/mastra-pii') && singleLinkSurface(indexHtml, '/work/docneedle'), 'Secondary homepage projects should each have one link surface.'],
  [indexHtml.includes('href="/resume"') && indexHtml.includes('Skip to content'), 'Home should link Resume and retain the skip link.'],
  [resumeHtml.includes('Verified professional experience timeline') && !resumeHtml.includes('Download resume'), 'Resume should render the timeline without a PDF action.'],
  [careerCopilotHtml.includes('href="/work/career-copilot/decisions/context-memory-boundary"') && careerCopilotHtml.includes('ADR not yet published') && careerCopilotHtml.includes('Published ADR'), 'Career Copilot should distinguish published and unpublished ADRs.'],
  [!docNeedleHtml.includes('/work/docneedle/decisions/') && docNeedleHtml.includes('ADR not yet published'), 'DocNeedle should not link its unpublished ADR.'],
  [aboutHtml.includes('https://github.com/KripaMishra') && aboutHtml.includes('https://www.linkedin.com/in/kripa-mishra/'), 'About should use approved social profiles.'],
  [aboutHtml.includes('Contact details pending approval'), 'About contact placeholder should remain inert.'],
];

if (stage === 'review') {
  assertions.push(
    [articleSlugs.every((slug) => singleLinkSurface(indexHtml, `/writing/${slug}`)), 'Review home should link each canonical article once.'],
    [articleSlugs.every((slug) => writingHtml.includes(`/writing/${slug}`)), 'Review Writing index should link all canonical articles.'],
    [careerCopilotHtml.includes('/writing/trusted-ingress-before-more-tools') && careerCopilotHtml.includes('/writing/fail-closed-redaction-foundation') && docNeedleHtml.includes('/writing/separate-product-surface-from-benchmark-harnesses'), 'Review project pages should link their canonical related articles.'],
    [indexHtml.includes('PUBLIC_PORTFOLIO_STAGE=production') && writingHtml.replace(/<wbr\s*\/?\s*>/g, '').includes('PUBLIC_PORTFOLIO_STAGE=production'), 'Review pages should explain production filtering.'],
    [resumeHtml.includes('Preview-only confirmation queue') && resumeHtml.includes('Needs Kripa confirmation'), 'Review Resume should expose confirmation notes.'],
  );
} else {
  const productionSurfaces = `${indexHtml}\n${writingHtml}\n${projectHtml}`;
  assertions.push(
    [articleSlugs.every((slug) => !productionSurfaces.includes(slug)), 'Production home, Writing, and project relations must omit review article links.'],
    [!productionSurfaces.toLowerCase().includes('review-draft'), 'Production surfaces must omit review-draft labels.'],
    [!resumeHtml.includes('Preview-only confirmation queue') && !resumeHtml.includes('Needs Kripa confirmation') && !resumeHtml.includes('Confirm whether'), 'Production Resume must omit confirmation-only text.'],
  );
}

const failedAssertions = assertions.filter(([ok]) => !ok);

if (failedAssertions.length > 0) {
  throw new Error(failedAssertions.map(([, message]) => message).join('\n'));
}

const chromiumPath = chromiumCandidates.find((candidate) => existsSync(candidate));

if (!chromiumPath) {
  throw new Error('Chromium is required for layout regression checks.');
}

mkdirSync(artifactsDir, { recursive: true });

const mimeTypeFor = (filePath) => ({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}[extname(filePath)] ?? 'application/octet-stream');

const resolveRequestPath = (requestUrl) => {
  const pathname = new URL(requestUrl, 'http://127.0.0.1').pathname;
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const absolutePath = resolve(distDir, relativePath);

  if (absolutePath !== distDir && !absolutePath.startsWith(`${distDir}/`)) return null;
  if (!existsSync(absolutePath)) return null;
  if (!statSync(absolutePath).isDirectory()) return absolutePath;

  const nestedIndex = join(absolutePath, 'index.html');
  return existsSync(nestedIndex) ? nestedIndex : null;
};

writeFileSync(harnessPath, `<!doctype html>
<meta charset="utf-8">
<iframe id="frame" style="width:100vw;height:100vh;border:0"></iframe>
<pre id="result">pending</pre>
<script>
  const frame = document.getElementById('frame');
  const result = document.getElementById('result');
  frame.addEventListener('load', () => {
    const check = (attempt = 0) => {
      const doc = frame.contentDocument;
      const header = doc.querySelector('[data-site-header]');
      const content = doc.querySelector('[data-site-header-content]');
      const shell = doc.querySelector('[data-scroll-progress-shell]');
      const status = doc.querySelector('[data-scroll-progress-status]');
      if ((!shell || shell.dataset.ready !== 'true') && attempt < 60) return setTimeout(() => check(attempt + 1), 50);
      if (!header || !content || !shell || !status) return result.textContent = JSON.stringify({ ok: false, reason: 'missing-elements' });
      const headerRect = header.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const shellRect = shell.getBoundingClientRect();
      const statusRect = status.getBoundingClientRect();
      const horizontalOverflow = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth) - frame.contentWindow.innerWidth;
      const expectedTheme = new URLSearchParams(location.search).get('theme') || 'light';
      const activeTheme = doc.documentElement.dataset.theme;
      const payload = {
        ok: activeTheme === expectedTheme && getComputedStyle(header).position === 'sticky' && getComputedStyle(shell).position !== 'fixed' && shellRect.top >= contentRect.bottom - 1 && statusRect.top >= contentRect.bottom - 1 && shellRect.bottom <= headerRect.bottom + 1 && horizontalOverflow <= 1,
        theme: activeTheme,
        headerPosition: getComputedStyle(header).position,
        shellPosition: getComputedStyle(shell).position,
        contentBottom: +contentRect.bottom.toFixed(2),
        shellTop: +shellRect.top.toFixed(2),
        shellBottom: +shellRect.bottom.toFixed(2),
        statusTop: +statusRect.top.toFixed(2),
        headerBottom: +headerRect.bottom.toFixed(2),
        horizontalOverflow,
      };
      result.textContent = JSON.stringify(payload);
    };
    check();
  });
  const params = new URLSearchParams(location.search);
  localStorage.setItem('portfolio-theme', params.get('theme') === 'dark' ? 'dark' : 'light');
  frame.style.width = params.get('width') + 'px';
  frame.src = params.get('path') || '/';
</script>`, 'utf8');

const staticServer = createServer((request, response) => {
  const assetPath = request.url ? resolveRequestPath(request.url) : null;
  if (!assetPath) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': mimeTypeFor(assetPath) });
  response.end(readFileSync(assetPath));
});

const chromiumArgs = [
  '--headless=new',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-sandbox',
  '--no-first-run',
  '--no-default-browser-check',
  '--force-device-scale-factor=1',
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1600, capture: true },
  { name: 'laptop-1024', width: 1024, height: 1000 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 1200, capture: true },
  { name: 'mobile-360', width: 360, height: 1000 },
  { name: 'mobile-320', width: 320, height: 900 },
];
const themes = ['light', 'dark'];
const geometryResults = [];

try {
  const origin = await new Promise((resolveListen, rejectListen) => {
    staticServer.once('error', rejectListen);
    staticServer.listen(0, '127.0.0.1', () => {
      const address = staticServer.address();
      if (!address || typeof address === 'string') return rejectListen(new Error('Could not resolve test server port.'));
      resolveListen(`http://127.0.0.1:${address.port}`);
    });
  });

  for (const viewport of viewports) {
    const windowSize = `--window-size=${viewport.width},${viewport.height}`;
    const screenshot = viewport.capture ? resolve(artifactsDir, `home-${stage}-${viewport.name}.png`) : undefined;
    if (screenshot) {
      await runFile(
        chromiumPath,
        [...chromiumArgs, windowSize, '--virtual-time-budget=2500', `--screenshot=${screenshot}`, `${origin}/`],
        { timeout: 15000 },
      );
    }
    for (const theme of themes) {
      for (const layoutPath of layoutPaths) {
        const { stdout: dumpDom } = await runFile(
          chromiumPath,
          [
            ...chromiumArgs,
            windowSize,
            '--virtual-time-budget=4000',
            '--dump-dom',
            `${origin}/__layout-check__.html?path=${encodeURIComponent(layoutPath)}&width=${viewport.width}&theme=${theme}`,
          ],
          { timeout: 15000 },
        );
        const match = dumpDom.match(/<pre id="result">([^<]+)<\/pre>/);
        if (!match) throw new Error(`Could not read ${theme} ${viewport.name} ${layoutPath} geometry result.`);
        const geometry = JSON.parse(match[1]);
        if (!geometry.ok) throw new Error(`${theme} ${viewport.name} ${layoutPath} layout regression: ${JSON.stringify(geometry)}`);
        geometryResults.push({
          viewport: viewport.name,
          path: layoutPath,
          screenshot: theme === 'light' && layoutPath === '/' ? screenshot : undefined,
          ...geometry,
        });
      }
    }
  }
} finally {
  await new Promise((resolveClose) => staticServer.close(resolveClose));
  rmSync(harnessPath, { force: true });
}

console.log(`${stage} readiness checks passed for ${requiredPages.length} built pages.`);
console.log(`Layout checks passed: ${JSON.stringify(geometryResults)}`);

const progressSelector = '[data-scroll-progress]';
const statusSelector = '[data-scroll-progress-status]';
const sectionSelector = '[data-scroll-progress-section]';
const valueSelector = '[data-scroll-progress-value]';
const shellSelector = '[data-scroll-progress-shell]';
const headerSelector = '[data-site-header]';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const progressBar = document.querySelector<HTMLElement>(progressSelector);
const progressStatus = document.querySelector<HTMLElement>(statusSelector);
const progressSection = document.querySelector<HTMLElement>(sectionSelector);
const progressValue = document.querySelector<HTMLElement>(valueSelector);
const progressShell = document.querySelector<HTMLElement>(shellSelector);
const siteHeader = document.querySelector<HTMLElement>(headerSelector);

const headings = Array.from(
  document.querySelectorAll<HTMLElement>('main h1, main h2'),
).filter((heading) => heading.textContent?.trim());

const fallbackSection = document.title.split('—')[0]?.trim() || 'Top of page';

const getActiveSection = () => {
  const threshold = window.innerHeight * 0.35;
  let activeHeading = headings[0];

  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= threshold) {
      activeHeading = heading;
    } else {
      break;
    }
  }

  return activeHeading?.textContent?.trim() || fallbackSection;
};

if (progressBar && progressStatus && progressSection && progressValue) {
  let frame = 0;

  const syncHeaderOffset = () => {
    if (!siteHeader) {
      return;
    }

    document.documentElement.style.setProperty('--header-current-height', `${siteHeader.getBoundingClientRect().height}px`);
  };

  const updateProgress = () => {
    frame = 0;

    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollableHeight <= 0 ? 0 : window.scrollY / scrollableHeight, 0), 1);
    const progressPercent = `${Math.round(progress * 100)}%`;

    progressBar.style.transform = `scaleX(${progress})`;
    progressSection.textContent = getActiveSection();
    progressValue.textContent = progressPercent;
  };

  const requestUpdate = () => {
    if (frame) {
      return;
    }

    frame = window.requestAnimationFrame(updateProgress);
  };

  if (reduceMotion.matches) {
    progressBar.style.transition = 'none';
  }

  syncHeaderOffset();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => {
    syncHeaderOffset();
    requestUpdate();
  });
  reduceMotion.addEventListener('change', () => {
    progressBar.style.transition = reduceMotion.matches ? 'none' : '';
    requestUpdate();
  });

  if (siteHeader && 'ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      syncHeaderOffset();
      requestUpdate();
    });

    resizeObserver.observe(siteHeader);
  }

  if (progressShell) {
    progressShell.dataset.ready = 'true';
  }

  requestUpdate();
}

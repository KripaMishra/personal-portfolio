const storageKey = 'portfolio-theme';
const root = document.documentElement;
const themeToggleSelector = '[data-theme-toggle]';

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getStoredTheme = () => {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
};

const setStoredTheme = (value: string | null) => {
  try {
    if (value) {
      window.localStorage.setItem(storageKey, value);
      return;
    }

    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage access can fail in private contexts; ignore and keep the UI functional.
  }
};

const applyTheme = (theme: string) => {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

const updateToggleLabel = (button: HTMLButtonElement, theme: string) => {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  button.dataset.themeValue = nextTheme;
  button.setAttribute('aria-label', `Activate ${nextTheme} theme`);
  button.querySelector('[data-theme-toggle-label]')?.replaceChildren(theme === 'dark' ? 'Light' : 'Dark');
};

const syncButtons = () => {
  const activeTheme = root.dataset.theme ?? getSystemTheme();
  document.querySelectorAll<HTMLButtonElement>(themeToggleSelector).forEach((button) => {
    updateToggleLabel(button, activeTheme);
  });
};

const toggleTheme = () => {
  const currentTheme = root.dataset.theme ?? getSystemTheme();
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  setStoredTheme(nextTheme);
  syncButtons();
};

const preferredTheme = getStoredTheme() === 'dark' ? 'dark' : 'light';
applyTheme(preferredTheme);

document.querySelectorAll<HTMLButtonElement>(themeToggleSelector).forEach((button) => {
  button.addEventListener('click', toggleTheme);
});

syncButtons();

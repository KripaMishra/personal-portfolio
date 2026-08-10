export const siteOwner = 'Kripa Shankar Mishra';

export const siteLinks = {
  github: 'https://github.com/KripaMishra',
  linkedin: 'https://www.linkedin.com/in/kripa-mishra/',
} as const;

export const siteContact = {
  label: 'Contact details pending approval',
} as const;

export const pageTitle = (title?: string) => (title ? `${title} — ${siteOwner}` : siteOwner);

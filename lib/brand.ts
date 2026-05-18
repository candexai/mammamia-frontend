/** Central brand constants for mammam-ia (display + URLs). API service IDs stay unchanged. */

export const BRAND_NAME = "mammam-ia";
export const BRAND_NAME_TITLE = "mammam-ia";
export const BRAND_TAGLINE = "AI agents, conversations, and automations";
export const BRAND_DOMAIN = "mammam-ia.it";
export const BRAND_APP_URL = `https://www.${BRAND_DOMAIN}`;
export const BRAND_SUPPORT_EMAIL = `support@${BRAND_DOMAIN}`;
export const BRAND_INFO_EMAIL = `info@${BRAND_DOMAIN}`;

export const metadata = {
  title: `${BRAND_NAME_TITLE} – AI Platform`,
  description: BRAND_TAGLINE,
} as const;

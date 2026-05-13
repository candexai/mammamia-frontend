/**
 * Dev / local-only captcha bypass token. Backend accepts only when explicitly allowed
 * (development, or opt-in local mode with no server secret). Keep in sync with
 * backend/src/utils/captcha.util.ts
 */
export const DEV_CAPTCHA_BYPASS_TOKEN = "__AISTEIN_DEV_CAPTCHA_BYPASS_v1__";

/**
 * When true, RecaptchaWidget auto-supplies bypass token (no site key + dev, or
 * NEXT_PUBLIC_ALLOW_LOCAL_AUTH_WITHOUT_RECAPTCHA=true for e.g. `next start` without keys).
 */
export function shouldUseDevCaptchaBypass(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_CAPTCHA_BYPASS === "0") return false;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const missingSiteKey = !siteKey || String(siteKey).trim() === "";
  if (!missingSiteKey) return false;
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.NEXT_PUBLIC_ALLOW_LOCAL_AUTH_WITHOUT_RECAPTCHA === "true") return true;
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return true;
  }
  return false;
}

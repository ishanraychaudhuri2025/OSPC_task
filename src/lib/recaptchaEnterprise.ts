type RecaptchaEnterpriseClient = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: RecaptchaEnterpriseClient;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

/**
 * Retrieves a score-based reCAPTCHA Enterprise token for a user-triggered action.
 * The site key is public browser configuration; server credentials never enter this module.
 * Returns null only when no site key is configured, allowing local development without CAPTCHA.
 */
export async function getRecaptchaEnterpriseToken(action: string): Promise<string | null> {
  const siteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim();
  if (!siteKey) return null;

  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA Enterprise is available only in the browser.');
  }

  if (!window.grecaptcha?.enterprise) {
    if (!scriptPromise) {
      scriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;
        script.async = true;
        script.defer = true;
        script.dataset.recaptchaEnterprise = 'true';
        script.onload = () => resolve();
        script.onerror = () => {
          scriptPromise = null;
          reject(new Error('Unable to load reCAPTCHA Enterprise.'));
        };
        document.head.appendChild(script);
      });
    }
    await scriptPromise;
  }

  const enterprise = window.grecaptcha?.enterprise;
  if (!enterprise) throw new Error('reCAPTCHA Enterprise did not initialize.');

  await new Promise<void>((resolve) => enterprise.ready(resolve));
  const token = await enterprise.execute(siteKey, { action });
  if (!token || token.length > 10_000) {
    throw new Error('reCAPTCHA Enterprise returned an invalid token.');
  }
  return token;
}

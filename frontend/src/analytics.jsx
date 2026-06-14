// Google Analytics 4 (gtag.js) — loaded only when a measurement ID is configured.
// Set REACT_APP_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) to enable. No-ops otherwise,
// so local dev without the env var produces no analytics traffic.

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

let initialized = false;

/**
 * Inject gtag.js and initialize GA4. Safe to call multiple times; only the
 * first call with a configured measurement ID takes effect. Automatic page
 * views are disabled — trackPageView handles them so SPA route changes count.
 */
export const initGA = () => {
  if (initialized || !GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
};

/**
 * Send a page_view event for the current SPA route.
 * @param {string} path - The path + search to report (e.g. "/dashboard").
 */
export const trackPageView = (path) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};

/**
 * Send a custom event.
 * @param {string} name - GA4 event name.
 * @param {Object} [params] - Event parameters.
 */
export const trackEvent = (name, params = {}) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
};

import { useEffect } from 'react';

const SITE_URL = 'https://devtracedash.netlify.app';

const upsert = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const setDescription = (content) => {
  const el = upsert('meta[name="description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    return m;
  });
  el.setAttribute('content', content);
};

const setCanonical = (href) => {
  const el = upsert('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  });
  el.setAttribute('href', href);
};

// Whatever index.html shipped, captured before any route overrides it.
const DEFAULTS = {
  title: document.title,
  description: document.head.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  canonical: `${SITE_URL}/`,
};

/**
 * Sets the title, description and canonical URL for a single route, and
 * restores the index.html defaults when that route unmounts.
 *
 * Googlebot renders JavaScript, so these are picked up for indexing. Social
 * crawlers (Facebook, LinkedIn, X) do not run JS and will keep showing the
 * og:/twitter: tags from index.html until the app is prerendered.
 *
 * @param {{ title: string, description: string, path: string }} meta
 */
export const usePageMeta = ({ title, description, path }) => {
  useEffect(() => {
    document.title = title;
    setDescription(description);
    setCanonical(`${SITE_URL}${path}`);

    return () => {
      document.title = DEFAULTS.title;
      setDescription(DEFAULTS.description);
      setCanonical(DEFAULTS.canonical);
    };
  }, [title, description, path]);
};

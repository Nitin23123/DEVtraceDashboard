import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Global smooth-scroll instance.
 *
 * `anchors` makes Lenis intercept same-page `#hash` links (the landing page nav)
 * and ease to them instead of jumping — offset clears the 64px sticky header.
 * `autoRaf` runs Lenis' own requestAnimationFrame loop, so we don't hand-roll one.
 *
 * Users who ask for reduced motion get no instance at all; the browser's native
 * scrolling is left completely untouched.
 */
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lenis = prefersReducedMotion
  ? null
  : new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      autoRaf: true,
      anchors: { offset: -80 },
    });

/** Jump to the top instantly — used on route changes. */
export function resetScroll() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
}

/** Ease to any target (selector, element, or offset). Falls back gracefully. */
export function scrollTo(target, options = {}) {
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: -80, ...options });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
}

export default lenis;

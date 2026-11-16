import { useEffect, useRef } from 'react';
import { mountMotif } from '../../brand/motifs';
import BRAND_TOKENS from '../../data/brandTokens.json';

/**
 * Hero motif. Renders the active brand motif (brand/tokens.json → motif.active,
 * Hamilton's Icosian game by default) from the shared motif library, alive.
 *
 * - Colours are CSS variables, so the graph follows day and night mode.
 * - Time accumulates only while it runs: it pauses off screen, in a hidden tab
 *   and below the lg breakpoint (where the element is not displayed), and
 *   resumes without a jump.
 * - With prefers-reduced-motion it shows the motif's still frame.
 * - Decorative: aria-hidden. Its story lives in the brand book.
 */
const PALETTE = {
  primary: 'rgb(var(--brand-primary))',
  harmonic: 'rgb(var(--brand-harmonic))',
  contrast: 'rgb(var(--brand-contrast))',
  muted: 'rgb(var(--brand-muted))',
};

export default function HeroVisual({ motif = BRAND_TOKENS.motif.active }) {
  const ref = useRef(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return undefined;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    // Finer than the 200-unit default: at hero size the type must stay the hero.
    const live = mountMotif(svg, motif, PALETTE, { stroke: 0.62, node: 0.72, opacity: 0.82 });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let elapsed = 0;
    let last = null;
    let onScreen = true;

    const loop = (now) => {
      if (last !== null) elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      live.update(elapsed);
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      last = null;
      if (reduce.matches) { live.update(live.still); return; }
      if (onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); });
    io.observe(svg);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener?.('change', sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener?.('change', sync);
    };
  }, [motif]);

  return (
    <div
      className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[340px] xl:w-[440px] aspect-square pointer-events-none"
      aria-hidden="true"
    >
      <svg ref={ref} viewBox="0 0 200 200" className="w-full h-full overflow-visible" fill="none" />
    </div>
  );
}

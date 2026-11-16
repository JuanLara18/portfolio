import { Link } from 'react-router-dom';

/**
 * Brand signature, identity v1 (approved 2026-11-15). Spec: docs/brand.md › Visual identity.
 *
 * Symbol: a J drawn as a graph. One edge, two ink nodes at its ends, and the
 * amber node where the full stop would be. The full stop is the brand device:
 * it also closes the tagline and every page and post title.
 *
 * Name: IBM Plex Serif Medium, upright, never italic.
 * Rule: one period per signature. Next to the symbol the name has no period;
 * alone (variant "wordmark") it carries the amber one.
 *
 * Ink follows currentColor; the node uses the mode-aware contrast token.
 * Geometry mirrors brand/tokens.json (logo.regular / logo.small); static files come from brand/logo/.
 *
 * Variants: `full` (symbol + name, default), `mark` (symbol only), `wordmark` (name + period).
 * Sizes: sm, md (default), lg, xl.
 */
const SIZES = {
  sm: { mark: 17, text: 'text-[15px]' },
  md: { mark: 23, text: 'text-[20px]' },
  lg: { mark: 30, text: 'text-[26px]' },
  xl: { mark: 44, text: 'text-[38px]' },
};

export const BrandMark = ({ size = 23, small = false, className = '' }) => {
  // `small` = optical cut for 16–32 px: heavier stroke, larger nodes.
  const g = small
    ? { d: 'M26 9.5V27C26 34 21.5 38 14 38', w: 6, top: [26, 9.5], end: [12.5, 38], node: [38.5, 37.5], r: 6, rn: 6 }
    : { d: 'M25 9V28C25 34.6 20.5 38 15 38', w: 4.2, top: [25, 9], end: [14, 38], node: [35.2, 37], r: 4.6, rn: 5.4 };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={g.d} stroke="currentColor" strokeWidth={g.w} />
      <circle cx={g.top[0]} cy={g.top[1]} r={g.r} fill="currentColor" />
      <circle cx={g.end[0]} cy={g.end[1]} r={g.r} fill="currentColor" />
      <circle cx={g.node[0]} cy={g.node[1]} r={g.rn} className="fill-brand-contrast" />
    </svg>
  );
};

const Logo = ({ variant = 'full', size = 'md', to = '/', className = '', onClick }) => {
  const s = SIZES[size] ?? SIZES.md;

  const content = (
    <span className={`inline-flex items-center gap-[0.42em] ${s.text} ${className}`}>
      {variant !== 'wordmark' && <BrandMark size={s.mark} small={s.mark < 20} />}
      {variant !== 'mark' && (
        <span className="type-name leading-none whitespace-nowrap">
          Juan Lara
          {variant === 'wordmark' && <span className="text-brand-contrast">.</span>}
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        aria-label="Juan Lara · AI Engineer, home"
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;

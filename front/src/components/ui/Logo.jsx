import { Link } from 'react-router-dom';

/**
 * Brand mark — Variant 04 (sigil + wordmark).
 *
 * The sigil is two horizontal stacked bars: top shorter and offset right,
 * bottom longer. Reads as "knowledge stack / data layers / production
 * platform on top of foundations". Custom-drawn, ownable.
 *
 * The wordmark "Juan Lara" is set in Inter 600. The mark uses currentColor
 * so it adapts to the surrounding text color (light on dark, dark on light).
 *
 * Variants:
 *   - `full` (default): sigil + wordmark inline. Use in nav, footer, mobile.
 *   - `mark`: sigil only. Use in compact contexts.
 *   - `wordmark`: text only. Rare, falls back when SVG can't render.
 *
 * Sizes: `sm` (16px mark, 14px text), `md` (22px / 18px, default),
 *        `lg` (32px / 22px), `xl` (48px / 32px).
 */
const Logo = ({
  variant = 'full',
  size = 'md',
  to = '/',
  className = '',
  accent = false,
  onClick,
}) => {
  const sizeMap = {
    sm: { mark: 16, text: 'text-sm' },
    md: { mark: 22, text: 'text-lg' },
    lg: { mark: 32, text: 'text-xl' },
    xl: { mark: 48, text: 'text-3xl' },
  };
  const s = sizeMap[size] ?? sizeMap.md;

  const accentClass = accent ? 'text-brand-accent' : '';

  const Mark = () => (
    <svg
      width={s.mark}
      height={s.mark}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      className={`flex-shrink-0 ${accentClass}`}
      aria-hidden="true"
    >
      <path d="M9 8h12" />
      <path d="M3 14h18" />
    </svg>
  );

  const Wordmark = () => (
    <span className={`font-sans font-semibold tracking-tight ${s.text}`}>
      Juan Lara
    </span>
  );

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {(variant === 'full' || variant === 'mark') && <Mark />}
      {(variant === 'full' || variant === 'wordmark') && <Wordmark />}
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        aria-label="Juan Lara — Senior AI Engineer"
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;

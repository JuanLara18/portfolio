import { LayoutGrid, List } from 'lucide-react';

/**
 * Reusable grid/list view toggle. Mono uppercase pattern, single cyan accent.
 *
 * Props:
 *   - value:    'grid' | 'list'
 *   - onChange: (next) => void
 *   - className: optional wrapper classes
 */
export default function ViewToggle({ value = 'grid', onChange, className = '' }) {
  const btn = (mode, Icon, label) => {
    const active = value === mode;
    return (
      <button
        type="button"
        onClick={() => onChange?.(mode)}
        aria-label={label}
        aria-pressed={active}
        className={`inline-flex items-center justify-center w-7 h-7 transition-colors ${
          active
            ? 'text-cyan-700 dark:text-brand-accent'
            : 'text-gray-400 dark:text-brand-fg-muted hover:text-gray-700 dark:hover:text-brand-fg'
        }`}
      >
        <Icon size={15} strokeWidth={1.8} />
      </button>
    );
  };

  return (
    <div className={`inline-flex items-center ${className}`} role="group" aria-label="View mode">
      {btn('grid', LayoutGrid, 'Grid view')}
      {btn('list', List, 'List view')}
    </div>
  );
}

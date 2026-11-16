/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Brand identity v1 (approved 2026-11-15). Spec: docs/brand.md › Visual identity.
      // IBM Plex superfamily: Serif = voice and name, Sans = reading and UI, Mono = code and labels.
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"IBM Plex Serif"', 'Georgia', '"Times New Roman"', 'serif'],
        serif: ['"IBM Plex Serif"', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      colors: {
        // Palette "Instrumento": cyan (primary) + cobalt (harmonic) + amber (contrast).
        // Static keys hold NIGHT values and are used behind `dark:`; day mode uses cyan-700 for primary.
        // primary/harmonic/contrast follow the active mode through CSS variables (src/index.css).
        brand: {
          bg: '#05070A',          // Night canvas, near-black for low-light reading
          'bg-soft': '#0C1017',   // Night surface (cards, code blocks)
          border: '#1A2130',      // Night hairline
          fg: '#E9E9E4',          // Night text, dimmed white to avoid halation on black
          'fg-muted': '#9AA2B1',  // Night secondary text
          accent: '#22D3EE',      // Primary (cyan), night value
          'contrast-night': '#F5B544', // Amber on always-dark surfaces (post hero)
          'accent-soft': '#67E8F9', // Primary hover, night
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          harmonic: 'rgb(var(--brand-harmonic) / <alpha-value>)',
          contrast: 'rgb(var(--brand-contrast) / <alpha-value>)',
        },
  // Added custom color palette
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        primary: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#a4bcff',
          400: '#8098ff',
          500: '#6b76ff',
          600: '#2563eb', // Main primary color
          700: '#1d4ed8', // Darker primary for hover states
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4338ca', // Main secondary color
          700: '#3730a3',
          800: '#312e81',
          900: '#2e1065',
        },
      },
      animation: {
        'bounce-slow': 'bounce 3s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
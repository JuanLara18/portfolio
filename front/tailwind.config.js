// Brand values come from brand/tokens.json (the single source). Run `npm run brand` after editing it.
const BRAND = require('../brand/tokens.json');
const { night } = BRAND.color;
const stack = (f) => [`"${BRAND.font[f].family}"`, ...BRAND.font[f].fallback.split(',').map((s) => s.trim())];
const role = (k) => `rgb(var(--brand-${k}) / <alpha-value>)`;

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
      // IBM Plex superfamily: Serif = voice and name, Sans = reading and UI, Mono = code and labels.
      fontFamily: {
        sans: stack('sans'),
        display: stack('serif'),
        serif: stack('serif'),
        mono: stack('mono'),
      },
      colors: {
        // Static keys hold NIGHT values and are used behind `dark:`; day mode uses cyan-700 for primary.
        // primary/harmonic/contrast follow the active mode through CSS variables (src/index.css).
        // Static keys = night values, used behind `dark:` (day primary is cyan-700 in markup).
        // primary / harmonic / contrast follow the active mode through CSS variables.
        brand: {
          bg: night.bg,
          'bg-soft': night.surface,
          border: night.border,
          fg: night.text,
          'fg-muted': night.muted,
          accent: night.primary,
          'accent-soft': night.primaryHover,
          'contrast-night': night.contrast,
          primary: role('primary'),
          harmonic: role('harmonic'),
          contrast: role('contrast'),
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
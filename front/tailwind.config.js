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
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Newsreader', 'Inter', 'serif'],
        mono: ['"JetBrains Mono"', '"Source Code Pro"', 'monospace'],
      },
      colors: {
        // Brand v2 — Variant 04 (Logo B sigil + Cyan accent)
        // Locked 2026-05-01. Mirror in CSS where Tailwind isn't available.
        brand: {
          bg: '#0B1120',          // Deep navy, replaces gray-900 as dark canvas (slightly warmer than pure #0A0F1E)
          'bg-soft': '#101a2e',   // Slightly lifted surface (cards, sections)
          fg: '#F5F5F0',          // Warm white, replaces slate-100 as primary text
          'fg-muted': '#A1A9BB',  // Muted gray, for kickers and meta — brighter for dark-mode legibility
          accent: '#22D3EE',      // Cyan-400 exact, the only accent color
          'accent-soft': '#67E8F9', // Cyan-300 for hover/secondary
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
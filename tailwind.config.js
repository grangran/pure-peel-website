/** 
 * TAILWIND CSS CONFIGURATION 
 * 
 * Purpose: Configures Tailwind CSS utility classes for styling the entire website 
 * 
 * Key Responsibilities: 
 * -Define which files Tailwind should scan for class names (content purging)
 * -Customize the default Tailwind theme (colours, fonts, spacing, etc,)
 * -Extend or override Tailwind's built-in design system 
 * 
 * How Tailwind Works: 
 * 1. Scans all files in 'content' array for class names (eg. "bg-blue-500", text-lg")
 * 2. Generates CSS ONLY for the classes that are used (keeps bundle size small) 
 * 3. Purges unused styles in production builds 
 * 
 * When This Runs: 
 * -During development: every time a file is saved with Tailwind classes 
 * -During build: generates optimized production CSS with only used classes 
 * 
 * Related Files: 
 * -postcss.config.js -> Processes Tailwind through PostCSS
 * -src/index.css -> Imports Tailwind's base styles (@tailwind directives) 
*/

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── FONTS ──
      fontFamily: {
        sans: ['Jost', 'Inter', '-apple-system', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },

      // ── BRAND COLOURS ──
      colors: {
        brand: {
          bg:       '#faf7f2',   // cream — main background
          'bg-dark':'#f2ece0',   // darker cream — alternate sections
          dark:     '#0f0a04',   // near black — dark sections
          'dark-mid':'#1a1208',  // mid dark — dark alternate sections
          gold:     '#e8c84a',   // primary gold accent
          'gold-light':'#f5e6a3',// light gold — button hover
          text:     '#1c1008',   // primary text
          'text-mid':'#5c4a2a',  // secondary text
          'text-light':'#9a8060',// muted text
          orange:   '#c85a08',   // citrus orange accent
        }
      },

      // ── ANIMATIONS ──
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollBounce: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%':      { transform: 'translateY(6px)', opacity: '1' },
        },
        growLine: {
          '0%':   { width: '0', opacity: '0' },
          '100%': { width: '72px', opacity: '1' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
      },
      animation: {
        'fadeUp':        'fadeUp 1s cubic-bezier(0.22,1,0.36,1) forwards',
        'scrollBounce':  'scrollBounce 2.2s ease-in-out infinite',
        'growLine':      'growLine 1s ease forwards',
        'ripple':        'ripple 0.6s ease-out forwards',
        'pulseDot':      'pulseDot 2s ease-in-out infinite',
      },
    },
  },
}


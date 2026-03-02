/** 
 * POSTCSS CONFIGURATION 
 * Purpose: Configures PostCSS plugins that process CSS during the buld. 
 * PostCSS is a tool that transforms CSS with JavaScript plugins 
 * 
 * Key Responsibilities: 
 * -Process Tailwaind CSS directives (@tailwind, @apply, @layer)
 * -Add vendor prefixes for cross-broswer compatibility 
 * -Transforms modern CSS into browser-compatible CSS 
 * 
 * How it Works: 
 * 1. Vite runs PostCSS on all CSS files during build 
 * 2. @tailwindcss/postcss prcoesses Tailwind utilities and generates CSS 
 * 3. Autoprefixer adds vendor prefixes (-webkit-, -moz-, etc.)
 * 4. Output is optimized, browser-compatible CSS
 * 
 * When This Runs: 
 * -Every time you save a CSS file (dev mode)
 * -During production build (npm runn build)
 */

export default {
  plugins: {
    //Tailwind CSS plugin- processes @tailwind directives and generates utility classes 
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}




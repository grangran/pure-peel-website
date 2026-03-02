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

  //====================
  //CONTENT SCANNING 
  //Tells Tailwind which files to scan for clsss names 
  //====================
  content: [
    "./index.html",      //Scan root HTML file
    "./src/**/*.{js,ts,jsx,tsx}", //Scan ALL JS/TS/JSX/TSX files in src folder and subfolders
  ],
 
 //====================
 //THEME CUSTOMIZATION 
 //====================
  theme: {
    extend: {
      //Font family configuration 
      //Usage in code: className="font-sansas ffosysenstf"
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
}



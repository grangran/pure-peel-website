/**
 * ESLINT CONFIGURATION (Flat Config Format) 
 * 
 * Purpose: Defines code quality and stlye rules for JavaScript/React files
 * ESLint is a "linter" that catches errors, enforces best practives, and maintains code consistency 
 * 
 * Key Responsibilities: 
 * -Catch bugs before runtime (undefined variables, typos, logic errors)
 * -Enforce React best practices (proper hook usage, component exports) 
 * -Maintain consistent code style across the project 
 * -Warn about potentian performance issues 
 * 
 * When This Runs: 
 * -Automatically in editor as typing is happening 
 * - When I run: npm run lint 
 * 
 * Related Files: 
 * -All files in src/ folder (React components) 
 * Does NOT lint: server.js, utils/, dist/, node_modules/
 */

import js from "@eslint/js"    //ESlint's recommended JavaScript rules
import globals from "globals"   //Browser global variables (window, document, etc.)
import reactHooks from "eslint-plugin-react-hooks"   //React Hooks rules 
import reactRefresh from "eslint-plugin-react-refresh"   //Fast Refresh (hot reload) rules 

export default [
  //======================
  //IGNORED FILES/FOLDERS 
  //ESLint will skip these completely 
  {
    ignores: ["dist/**", "node_modules/**", ".vite/**", "utils/**", "server.js"],
  },
  //=====================
  //BASE JAVASCRIPT RULES 
  //ESLint's recommended rules for all JS files 
  //====================

  {
    ...js.configs.recommended, //Includes rules like: noo-undef, no unused-vars, no-redeclare, etc. 
    files: ["src/**/*.{js,jsx}"],   //Only lint frontend React files 
  },
  
  //===================
  //REACT SPECIFIC RULES 
  //Custom configuration for React + JSX
  //===================
  {
    files: ["src/**/*.{js,jsx}"],  //Apply to all React files in src/ 
   
    languageOptions: {
      ecmaVersion: "latest",  
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Keep hooks safety rules strict, but avoid noisy opinionated rules.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "no-dupe-keys": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]


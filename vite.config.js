/**
 * VITE CONFIGURATION FILE 
 * Purpose: Configures the Vite build tool and development server for the react application 
 * 
 * Key Responsibilities:
 * -Sets up React with SWC (Speedy Web Compiler) for faster builds and hot module replacement 
 * -Configures development server settings (host, port, etc.) 
 * -Defines build optimization and bundling behaviour 
 * 
 * When This Runs:
 * -During development: 'npm run dev' starts the dev server with these settings 
 * -During build: 'npm run build' uses these configs to create production bundle 
 * 
 * Dependencies: 
 * -vite: The buld tool itself 
 * -@vitejs/plugin-react-swc: React plugin using SWC for faster compilation 
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    //Enabes React support with SWC compiler for fast refresh and JSX transformation 
    react()
  ],
  server: {
    // Bind explicitly to loopback (often more reliable than host: true/false)
    host: '127.0.0.1',
    port: 5178,
    strictPort: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: false,
  },
})




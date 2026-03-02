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
    //Listen on all network interfaces (0.0.0.0)- allows access from other devices on network 
    //Useful for testing on mobile devices during development 
    host: true, 

    //Development server port- default Vite port
    port: 5173,

    //If port 5173 is already in use, automatically try the next evailable port
    //Set to ture to fail if port is taken already 
    
    
    strictPort: false, // Allow other ports if 5173 is taken
  },
})




import path from "path"
import { execSync } from "child_process"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from "./package.json"

// Get Git info
const getGitInfo = () => {
  try {
    const revision = execSync('git rev-parse --short HEAD').toString().trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    return { revision, branch }
  } catch {
    return { revision: 'unknown', branch: 'unknown' }
  }
}

const gitInfo = getGitInfo()
const buildTime = new Date().toISOString()

/**
 * Modernized Vite 8 Configuration
 * Using Tailwind CSS v4 CSS-first engine.
 */
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify({
      version: packageJson.version,
      revision: gitInfo.revision,
      branch: gitInfo.branch,
      buildTime: buildTime
    })
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'fi-go',
        short_name: 'fi-go',
        theme_color: '#E5173F',
        background_color: '#E5173F',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Resolve @figo/shared directly to its TypeScript source.
      // This avoids the CJS/ESM named-export mismatch at runtime.
      "@figo/shared": path.resolve(__dirname, "../../projects/shared/src/index.ts"),
    },
  },
  build: {
    outDir: '../../dist/web',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules/,
            },
          ],
        },
      },
    },
  },
})

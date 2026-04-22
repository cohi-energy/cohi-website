import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Build a single self-mounting IIFE bundle that the static site loads with a
// regular <script src="cards-bundle.js"> tag. The bundle scans the page for
// `<div data-cohi-card="…">` mount points and renders the corresponding React
// pattern into each.
export default defineConfig({
  plugins: [react()],
  // React + framer-motion read `process.env.NODE_ENV` at module top-level. The
  // browser has no `process`, so we inline the production value at build time.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'cards-src/entry.tsx'),
      name: 'CohiCards',
      formats: ['iife'],
      fileName: () => 'cards-bundle.js',
    },
    rollupOptions: {
      output: {
        // Single file — no separate vendor chunk so the static site only loads
        // one tag.
        inlineDynamicImports: true,
        assetFileNames: (asset) => {
          if (asset.name && asset.name.endsWith('.css')) return 'cards-bundle.css'
          return 'assets/[name].[ext]'
        },
      },
    },
  },
})

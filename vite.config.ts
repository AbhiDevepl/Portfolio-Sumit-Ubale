import type {} from 'vite-react-ssg/node'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    // /gallery -> dist/gallery/index.html, so Netlify serves the extensionless
    // URLs the redirects point at without any rewrite rules.
    dirStyle: 'nested',
    script: 'defer',
    // beasties (critical-CSS inlining) is not installed; without this it warns
    // on every build.
    beastiesOptions: false,
  },
})

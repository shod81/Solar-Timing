import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/** Vite Plugin: Ersetzt __BUILD_HASH__ in dist/sw.js durch einen eindeutigen Build-Hash. */
function swCacheBuster(): Plugin {
  return {
    name: 'sw-cache-buster',
    writeBundle(options) {
      const outDir = options.dir || 'dist'
      const swPath = path.join(outDir, 'sw.js')
      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, 'utf-8')
        const buildHash = Date.now().toString(36)
        content = content.replace(/__BUILD_HASH__/g, buildHash)
        fs.writeFileSync(swPath, content, 'utf-8')
        console.log(`[sw-cache-buster] Service Worker CACHE_VERSION updated to solartime-v-${buildHash}`)
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), swCacheBuster()],
  // Relative Basis, damit die gebauten Dateien auch auf Shared Hosting
  // in Unterverzeichnissen oder direkt im Webroot laufen.
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: 'index.html',
        embed: 'embed.html',
      },
    },
  },
})

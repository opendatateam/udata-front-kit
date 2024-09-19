import ViteYaml from '@modyfi/vite-plugin-yaml'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'
import { createHtmlPlugin } from 'vite-plugin-html'

interface Config {
  website: {
    title: string
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configDir = `./configs/${env.VITE_SITE_ID}`
  const configFileUrl = new URL(`${configDir}/config.yaml`, import.meta.url)
  const config = load(readFileSync(configFileUrl, 'utf-8')) as Config
  return {
    base: '/',
    plugins: [
      vue(),
      ViteYaml(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: config.website.title
          }
        }
      }),
      dynamicImport({
        onFiles(files, id) {
          // include only the current site routes definition in the bundle
          if (id.includes('/src/router/index.ts')) {
            return files.filter((routeFile) =>
              routeFile.includes(`custom/${env.VITE_SITE_ID}/routes.ts`)
            )
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@root': resolve(__dirname, './'),
        '@siteConfig': fileURLToPath(new URL(configDir, import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        vue: 'vue/dist/vue.esm-bundler.js'
      }
    },
    test: {
      environment: 'happy-dom',
      globals: true
    }
  }
})

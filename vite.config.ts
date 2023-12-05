import ViteYaml from '@modyfi/vite-plugin-yaml'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'
import { createHtmlPlugin } from 'vite-plugin-html'
import markdownRawPlugin from 'vite-raw-plugin'

interface Config {
  website: {
    title: string
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configDir = `./configs/${env.CONFIG_NAME}`
  const configFileUrl = new URL(`${configDir}/config.yaml`, import.meta.url)
  const config = load(readFileSync(configFileUrl, 'utf-8')) as Config
  return {
    base: '/',
    plugins: [
      vue(),
      ViteYaml(),
      dynamicImport(),
      markdownRawPlugin({
        fileRegex: /\.md$/
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: config.website.title
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@root': resolve(__dirname, './'),
        '@siteConfig': fileURLToPath(new URL(configDir, import.meta.url)),
        vue: 'vue/dist/vue.esm-bundler.js'
      }
    },
    test: {
      environment: 'happy-dom',
      globals: true
    }
  }
})

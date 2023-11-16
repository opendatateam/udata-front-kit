import ViteYaml from '@modyfi/vite-plugin-yaml'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      ViteYaml(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: env.WEBSITE_NAME
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@root': resolve(__dirname, './'),
        '@siteConfig': fileURLToPath(
          new URL(`./configs/${env.CONFIG_NAME}`, import.meta.url)
        )
      }
    },
    base: '/'
  }
})

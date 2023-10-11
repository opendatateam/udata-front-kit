import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteYaml from '@modyfi/vite-plugin-yaml'

// https://vitejs.dev/config/
export default defineConfig(({ mode })=> {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      ViteYaml(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@root': resolve(__dirname, './'),
        '@siteConfig': fileURLToPath(new URL(`./configs/${env.CONFIG_NAME}`, import.meta.url))
      }
    },
    base: '/',
  }
})

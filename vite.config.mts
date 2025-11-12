import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import ViteYaml from 'unplugin-yaml/vite'
import { defineConfig, loadEnv } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'
import { createHtmlPlugin } from 'vite-plugin-html'
import vueDevTools from 'vite-plugin-vue-devtools'

import {
  vueDsfrAutoimportPreset,
  vueDsfrComponentResolver
} from '@gouvminint/vue-dsfr/meta'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import type { SentryConfig } from './src/model/config'

interface Config {
  website: {
    title: string
    meta: {
      keywords: string
      description: string
      canonicalUrl: string
    }
  }
  robots: {
    meta: string
  }
  sentry?: SentryConfig
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
      vueDevTools(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['search'].includes(tag)
          }
        }
      }),
      AutoImport({
        include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
        imports: [
          // @ts-expect-error TS2322
          'vue',
          // @ts-expect-error TS2322
          'vue-router',
          // @ts-expect-error TS2322
          vueDsfrAutoimportPreset // Autoimport des composables de VueDsfr
        ],
        vueTemplate: true,
        dts: './src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './eslintrc-auto-import.mjs',
          globalsPropValue: true
        }
      }),
      // Autoimport des composants utilisés dans les templates
      Components({
        dirs: ['src/components', 'src/custom/**/components'], // Autoimport des composants
        deep: true,
        include: [/\.vue$/, /\.vue\?vue/],
        dts: './src/components.d.ts',
        resolvers: [
          vueDsfrComponentResolver // Autoimport des composants de VueDsfr dans les templates
        ]
      }),
      ViteYaml(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: config.website.title,
            meta: config.website.meta,
            metaRobots: config.robots.meta
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
      }),
      // Only enable Sentry if the site config has sentry configured and not in test environment
      ...(mode !== 'test' &&
      config.sentry?.domain_url &&
      process.env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              authToken: process.env.SENTRY_AUTH_TOKEN,
              org: 'sentry',
              project: env.VITE_SITE_ID,
              url: config.sentry.domain_url
            })
          ]
        : [])
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
    },
    build: {
      sourcemap: true // Source map generation must be turned on for sentry integration
    },
    optimizeDeps: {
      // Some `@datagouv/components-next` dependencies aren't scanned by Vite dev server.
      // It must optimized them to be able to handle commonjs dependencies.
      // See https://vite.dev/guide/dep-pre-bundling.html#customizing-the-behavior
      include: [
        'debug',
        'extend',
        'highlight.js',
        'rehype-highlight',
        'swagger-ui-dist',
        'unist-util-find',
        'unist-util-find-all-between',
        'vue',
        'vue-router',
        // geopf-extensions-openlayers and geoportal-access-lib contain legacy CommonJS modules
        // (es6-promise, eventbusjs) that need pre-bundling to be properly converted to ESM
        // for the dev server. Without this, map preview components fail to load.
        'geopf-extensions-openlayers',
        'geoportal-access-lib'
      ],
      // `@datagouv/components-next` shouldn't be optimize otherwise its vue instance is not the same
      // as the one used in udata-front-kit. This cause errors with the `provide` / `inject` functions
      // used for the components configuration.
      exclude: ['@datagouv/components-next']
    }
  }
})

import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'
import { createHtmlPlugin } from 'vite-plugin-html'
import vueDevTools from 'vite-plugin-vue-devtools'

import { vueDsfrAutoimportPreset } from '@gouvminint/vue-dsfr/meta'
import AutoImport from 'unplugin-auto-import/vite'
import { CONFIGS_DIR, loadSiteConfig } from './scripts/site-config'
import type { SentryConfig, WebsiteConfig } from './src/model/config'

interface Config {
  website: WebsiteConfig
  sentry?: SentryConfig
}

// Publishes the resolved site config as /site-config.json, and restarts the dev server on config changes
function siteConfigPlugin(config: Config): Plugin {
  return {
    name: 'site-config',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'site-config.json',
        source: JSON.stringify(config, null, 2)
      })
    },
    configureServer(server) {
      // config is resolved once in vite.config, so a config change needs a restart
      server.watcher.add(CONFIGS_DIR)
      server.watcher.on('change', (file) => {
        if (file.startsWith(CONFIGS_DIR)) void server.restart()
      })
    }
  }
}

// Shared esbuild config for dev and prod
const esbuildOptions = {
  supported: {
    // Tell esbuild that class fields are natively supported - don't transpile them
    // This prevents __publicField helper issues with maplibre-gl under pnpm
    'class-field': true,
    'class-static-field': true
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const config = loadSiteConfig<Config>(
    env.VITE_SITE_ID,
    env.VITE_DEPLOY_ENV || undefined
  )
  return {
    base: '/',
    define: {
      __SITE_CONFIG__: JSON.stringify(config)
    },
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
      siteConfigPlugin(config),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: config.website.title,
            meta: config.website.seo?.meta,
            metaRobots: config.website.seo?.meta?.robots
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
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        vue: 'vue/dist/vue.esm-bundler.js',
        // FIXME: xmlbuilder2 uses Node's EventEmitter, requiring this polyfill for the browser.
        // Replace xmlbuilder2 with native DOM APIs (document.implementation.createDocument + XMLSerializer).
        events: 'eventemitter3'
      }
    },
    test: {
      environment: 'happy-dom',
      globals: true
    },
    esbuild: esbuildOptions,
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
        'rehype-highlight',
        'unist-util-find',
        'unist-util-find-all-between',
        'vue',
        'vue-router',
        // geopf-extensions-openlayers and geoportal-access-lib contain legacy CommonJS modules
        // (es6-promise, eventbusjs) that need pre-bundling to be properly converted to ESM
        // for the dev server. Without this, map preview components fail to load.
        'geopf-extensions-openlayers',
        'geoportal-access-lib',
        // Include maplibre-gl to ensure proper bundling with esbuild class field support
        'maplibre-gl',
        // xmlbuilder2 uses CJS require('events') which needs pre-bundling to resolve the alias
        'xmlbuilder2',
        // leaflet is a dep of @datagouv/components-next which is excluded from optimizeDeps
        'leaflet'
      ],
      // `@datagouv/components-next` shouldn't be optimize otherwise its vue instance is not the same
      // as the one used in udata-front-kit. This cause errors with the `provide` / `inject` functions
      // used for the components configuration.
      exclude: ['@datagouv/components-next'],
      esbuildOptions
    }
  }
})

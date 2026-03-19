import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import json from 'eslint-plugin-json'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,ts,mts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true }
      ]
    }
  },
  {
    name: 'app/vue-components',
    files: ['**/*.vue'],
    rules: {
      'vue/no-undef-components': [
        'error',
        {
          ignorePatterns: [
            // VueDsfr: globally registered via app.use(VueDsfr)
            '^Dsfr[A-Z]',
            '^VIcon$',
            // vue-router: globally registered via app.use(router)
            '^RouterLink$',
            '^RouterView$',
            // vue3-text-clamp: globally registered via app.use(TextClamp)
            '^text-clamp$',
            // @gouvfr/dsfr-chart: web components registered via side-effect import
            '^bar-chart$',
            // native HTML element treated as custom element in vite config
            '^search$'
          ]
        }
      ]
    }
  },
  {
    name: 'files-to-ignore',
    ignores: [
      '.gitignore',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/*.d.ts'
    ]
  },
  eslintConfigPrettier,

  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  {
    files: ['**/*.json'],
    ...json.configs['recommended']
  },
  skipFormatting
]

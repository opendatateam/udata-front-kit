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
    name: 'files-to-ignore',
    ignores: [
      '.gitignore',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/*.d.ts',
      'eslintrc-auto-import.mjs',
      // FIXME: temporary ignore for tabular-dataviz module development
      'tabular-dataviz/**'
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

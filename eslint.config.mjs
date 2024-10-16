import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import json from 'eslint-plugin-json'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,ts,mts,tsx,vue}']
  },
  {
    name: 'files-to-ignore',
    ignores: ['.gitignore', '**/dist/**', '**/dist-ssr/**', '**/coverage/**']
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

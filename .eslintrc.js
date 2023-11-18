module.exports = {
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:json/recommended',
    '@vue/eslint-config-standard',
    'standard',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  overrides: [
    {
      extends: [
        '@vue/eslint-config-typescript',
        'standard-with-typescript',
        'prettier'
      ],
      files: ['*error.ts'],
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.dev.json',
        tsconfigRootDir: __dirname
      }
    }
  ]
}

module.exports = {
  env: {
    node: true
  },
  extends: [
    '@vue/eslint-config-standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:json/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    'standard'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser'
  }
}

module.exports = {
  env: {
    node: true
  },
  extends: [
    '@vue/eslint-config-standard',
    'plugin:json/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    'standard',
    'standard-with-typescript'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser'
  }
}

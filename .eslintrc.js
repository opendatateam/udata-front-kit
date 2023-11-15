module.exports = {
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-standard',
    'plugin:json/recommended',
    'eslint:recommended', 
    'plugin:@typescript-eslint/recommended',
    'standard',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser'
  }
}

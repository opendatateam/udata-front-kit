const { merge } = require('lodash/fp/object')

const prettierConfigStandard = require('prettier-config-standard')

const prettierSortImports = {
  importOrder: ['^@/(.*)$', '^[./]'],
  importOrderSeparation: true
}

module.exports = merge(prettierConfigStandard, prettierSortImports)

const prettierConfigStandard = require('prettier-config-standard')

const prettierSortImports = {
  importOrder: ['^@/(.*)$', '^[./]'],
  importOrderSeparation: true
}

module.exports = { ...prettierConfigStandard, ...prettierSortImports }

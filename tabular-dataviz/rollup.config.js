import { nodeResolve } from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/index.mjs',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [nodeResolve(), postcss()],
  external: ['chart.js']
}

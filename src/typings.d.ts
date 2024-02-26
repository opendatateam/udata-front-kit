import 'pinia'
import { type Router } from 'vue-router'

declare module '*.yaml' {
  const content: any
  export default content
}

// extened pinia store with $router as plugin
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $router: Router
  }
}

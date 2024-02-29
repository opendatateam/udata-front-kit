import 'pinia'
import { type Router } from 'vue-router'

// extend pinia store with $router as plugin
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $router: Router
  }
}

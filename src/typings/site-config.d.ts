// Resolved site config (base + deploy env override), provided by the site-config plugin in vite.config.mts
declare module 'virtual:site-config' {
  const content: any
  export default content
}

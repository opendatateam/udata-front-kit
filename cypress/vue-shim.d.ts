// @datagouv/components-next ships raw .ts source (main points to src/main.ts) which imports .vue files.
// Plain tsc can't resolve .vue imports: this shorthand declaration types them (default and named) as any.
declare module '*.vue'

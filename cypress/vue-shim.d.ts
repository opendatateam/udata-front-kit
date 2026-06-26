// @datagouv/components-next ships raw .ts source (main points to src/main.ts) which imports .vue files.
// Plain tsc can't resolve .vue imports, so this shim satisfies them when type-checking cypress.
declare module '*.vue' {}

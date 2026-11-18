// @datagouv/components-next ships raw .ts source (main points to src/main.ts) which imports .vue files.
// Plain tsc can't read .vue files, so any import from one (default or named) is typed as any.
declare module '*.vue'

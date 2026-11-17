// json-merge-patch ships no types (and @types/json-merge-patch types `apply` as returning the patch)
declare module 'json-merge-patch' {
  export function apply(target: unknown, patch: unknown): unknown
}

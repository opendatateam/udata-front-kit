import { toRaw } from 'vue'

import config, { configStorageKey } from '@/config'
import LocalStorageService from '@/services/LocalStorageService'

// config is a reactive singleton (see @/config.ts): mutating it in place
// updates the same object every other component reads through computed(),
// so HeaderComponent/App/HomeView hot-update as soon as this runs, with no
// separate preview implementation to keep in sync.
//
// Crucially, "in place" has to hold all the way down the tree: some
// consumers (HeaderComponent, App.vue) capture config.website once at setup
// via useWebsiteConfig() rather than through a computed(). If we ever
// replaced config.website itself with a new object (e.g. a naive
// delete-everything-then-Object.assign), those consumers would keep
// pointing at the old, orphaned object and stop updating forever. So the
// merge below only ever replaces leaf values — every nested object keeps
// its original identity.
//
// `prune`: when true (the manual YAML-textarea path in ConfigEditorView),
// a target key absent from source is deleted — correct there, since the
// textarea always holds the *complete* config. When false (the Albert
// tool-calling path, see store/AlbertChatStore.ts), absent keys are left
// untouched instead: Albert is only ever asked for a small subset of
// fields, so "absent" means "not part of this proposal," not "delete
// this." Pruning there wiped out config.website.header (and everything
// else outside that subset) on every generation.
export const deepAssignInPlace = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  { prune = true }: { prune?: boolean } = {}
) => {
  if (prune) {
    for (const key of Object.keys(target)) {
      if (!(key in source)) delete target[key]
    }
  }
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]
    const bothPlainObjects =
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    if (bothPlainObjects) {
      deepAssignInPlace(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
        { prune }
      )
    } else {
      target[key] = sourceValue
    }
  }
}

export const mergeConfigAndPersist = (
  parsed: Record<string, unknown>,
  options: { prune?: boolean } = {}
) => {
  deepAssignInPlace(
    config as unknown as Record<string, unknown>,
    parsed,
    options
  )
  LocalStorageService.setItem(configStorageKey, toRaw(config))
}

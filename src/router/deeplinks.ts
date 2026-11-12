import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

import { Tab } from '@/utils/tabs'

// TODO: temporary, drop once udata notification links use `?discussion_id=` and old emails are obsolete
// Rewrites legacy `#discussion-{id}` links on detail pages to `/discussions?discussion_id={id}`
export const rewriteDiscussionHash = (
  to: RouteLocationNormalized
): RouteLocationRaw | undefined => {
  if (!to.meta.objectType || !to.hash.startsWith('#discussion-')) return
  const id = to.hash.slice('#discussion-'.length)
  if (!id) return
  return {
    name: to.name,
    params: { ...to.params, tab: Tab.DISCUSSIONS },
    query: { discussion_id: id },
    replace: true
  }
}

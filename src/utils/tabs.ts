import type { DsfrTabItemProps } from '@gouvminint/vue-dsfr'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { TabWithCount } from '@/components/TabsWithCounts.vue'

export type RoutedTab = TabWithCount & { visible?: boolean }

// Slug of the tab that renders resources, targeted by `?resource_id` links
export const FILES_TAB = 'files'

// Slug of the discussions tab, stored by udata in notification links: do not rename
export const DISCUSSIONS_TAB = 'discussions'

// typed against DSFR so its required tab/panel ids stay covered
export const tabIds = (
  slug: string
): Pick<DsfrTabItemProps, 'tabId' | 'panelId'> => ({
  tabId: `tab-${slug}`,
  panelId: `tab-content-${slug}`
})

/**
 * Binds tabs to the optional `:tab` route param. The first visible tab is the
 * default and has no path segment. An unknown or hidden slug displays the
 * default tab without rewriting the URL.
 */
export const useRoutedTabs = (routedTabs: MaybeRefOrGetter<RoutedTab[]>) => {
  const route = useRoute()
  const router = useRouter()

  const list = computed(() =>
    toValue(routedTabs).filter((t) => t.visible !== false)
  )

  const currentSlug = computed(() => route.params.tab as string | undefined)

  const activeIndex = computed({
    get: () =>
      Math.max(
        0,
        list.value.findIndex((t) => t.slug === currentSlug.value)
      ),
    set: (index: number) => {
      const tab = list.value[index]
      if (tab) void selectTab(tab.slug)
    }
  })

  const selectTab = async (slug: string) => {
    const index = list.value.findIndex((t) => t.slug === slug)
    if (index === -1) return
    // compare with the URL, not the displayed tab, which falls back to the default
    const target = index === 0 ? undefined : slug
    if ((currentSlug.value || undefined) === target) return
    const { tab, ...params } = route.params
    // replace, not push: arrow-key navigation would otherwise flood the history
    // query is dropped: it belongs to the tab being left (e.g. ?resource_id)
    await router.replace({
      name: route.name,
      params: target ? { ...params, tab: target } : params
    })
  }

  return { tabs: list, activeIndex, selectTab }
}

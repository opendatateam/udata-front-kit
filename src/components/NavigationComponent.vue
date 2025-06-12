<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import config from '@/config'
import type { MenuConfig } from '@/model/config'

const route = useRoute()

const props = defineProps({
  onClick: {
    type: Function as PropType<(id: string) => void>,
    default: () => {}
  }
})

const isActive = (link: string) => {
  return route.matched.some(({ path }) => {
    if (path === '/') return link === path
    return link.indexOf(path) === 0
  })
}

const navItems = computed(() => {
  const menuConfig: MenuConfig[] = config.website.menu ?? []
  return menuConfig.map((item) => {
    return {
      ...item,
      'aria-current': isActive(item.to) ? 'page' : undefined
    }
  })
})
</script>

<template>
  <!-- pass a dummy nav-items to satisfy props check, we're overriding the slot anyway -->
  <DsfrNavigation id="main-nav" :nav-items="[]">
    <DsfrNavigationItem v-for="(navItem, idx) of navItems" :key="idx">
      <DsfrNavigationMenuLink
        v-if="navItem.to && navItem.text"
        v-bind="navItem"
        @toggle-id="props.onClick"
      />
    </DsfrNavigationItem>
  </DsfrNavigation>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import config from '@/config'

const route = useRoute()

const props = defineProps({
  onClick: {
    type: Function,
    default: () => {}
  }
})

const isActive = (link) => {
  return route.matched.some(({ path }) => {
    if (path === '/') return link === path
    return link.indexOf(path) === 0
  })
}

const navItems = computed(() => {
  return (config.website.menu ?? []).map((item) => {
    return {
      to: item.path,
      text: item.name,
      'aria-current': isActive(item.path) ? true : undefined
    }
  })
})
</script>

<template>
  <DsfrNavigation>
    <DsfrNavigationItem v-for="(navItem, idx) of navItems" :key="idx">
      <DsfrNavigationMenuLink
        v-if="navItem.to && navItem.text"
        v-bind="navItem"
        @toggle-id="props.onClick"
      />
    </DsfrNavigationItem>
  </DsfrNavigation>
</template>

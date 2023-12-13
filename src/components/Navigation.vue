<script setup>
import { computed } from 'vue'

import config from '@/config'

const props = defineProps({
  onClick: {
    type: Function,
    default: () => {}
  }
})

const navItems = computed(() => {
  const items = []
  config.website.router_items.forEach((item) => {
    if (item.display_menu) {
      items.push({
        to: item.linkPage,
        text: item.name
      })
    }
  })
  return items
})
</script>

<template>
  <DsfrNavigation>
    <DsfrNavigationItem v-for="(navItem, idx) of navItems" :key="idx">
      <DsfrNavigationMenuLink
        v-if="navItem.to && navItem.text"
        v-bind="navItem"
        @toggle-id="onClick"
      />
    </DsfrNavigationItem>
  </DsfrNavigation>
</template>

<style scoped></style>

<script setup>
import { computed } from 'vue'

import config from '@/config'

const navItems = computed(() => {
  const items = []
  config.website.menu_items.forEach((item) => {
    items.push({
      to: item.linkPage,
      text: item.name
    })
  })
  return items
})
</script>

<template>
  <DsfrNavigation :nav-items="navItems" />
</template>

<style scoped></style>

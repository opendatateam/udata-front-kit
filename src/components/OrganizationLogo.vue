<script setup lang="ts">
import type { OrganizationReference } from '@datagouv/components-next'
import { computed } from 'vue'

import config from '@/config'

const props = withDefaults(
  defineProps<{
    object: { organization?: OrganizationReference | null }
    size?: number
    padding?: number
  }>(),
  { size: 32, padding: 6 }
)

const logoSrc = computed(
  () =>
    props.object.organization?.logo_thumbnail ||
    `${config.datagouvfr.base_url}/_themes/gouvfr/img/placeholders/organization.png`
)

const style = computed(() => {
  const outerSize = props.size + props.padding * 2 + 1
  return {
    width: `${outerSize}px`,
    height: `${outerSize}px`,
    padding: `${props.padding}px`
  }
})
</script>

<template>
  <div class="logo" :style="style">
    <img :src="logoSrc" alt="" loading="lazy" :width="size" :height="size" />
  </div>
</template>

<style scoped>
.logo {
  display: inline-block;
  background: white;
  border: 1px solid var(--border-default-grey);
}
</style>

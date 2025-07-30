<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { computed } from 'vue'

import type { ExtendedDatasetV2 } from '@/model/dataset'
import type { Topic } from '@/model/topic'
import { useBaseUrl } from '@/utils/config'

const props = defineProps({
  object: {
    type: Object as () => DatasetV2 | ExtendedDatasetV2 | Topic,
    required: true
  },
  size: {
    type: Number,
    default: 32
  },
  padding: {
    type: Number,
    default: 6
  }
})

const logoSrc = computed(() => {
  return (
    props.object.organization?.logo_thumbnail ||
    `${useBaseUrl()}/_themes/gouvfr/img/placeholders/organization.png`
  )
})

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

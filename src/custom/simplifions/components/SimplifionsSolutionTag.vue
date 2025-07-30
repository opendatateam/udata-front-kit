<template>
  <p
    :class="`fr-badge fr-badge--sm fr-mb-2w fr-badge--no-icon ${isPublic ? 'fr-badge--success' : 'fr-badge--info'}`"
  >
    <span class="font-weight-normal">{{ tagText }}</span>
    <span v-if="solution?.operateur_nom">
      <span class="fr-ml-1v font-weight-normal"> | </span>
      {{ solution.operateur_nom }}
    </span>
  </p>
</template>

<script setup lang="ts">
import type { SimplifionsSolution } from '../model/solution'

const props = defineProps({
  solution: {
    type: Object as () => SimplifionsSolution,
    required: true
  }
})

const isPublic = computed(() => {
  return props.solution.is_public
})

const tagText = computed(() => {
  return isPublic.value ? 'Solution publique' : 'Solution privée'
})
</script>

<style scoped>
.font-weight-normal {
  font-weight: normal;
}
</style>

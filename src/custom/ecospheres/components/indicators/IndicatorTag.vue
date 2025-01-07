<script setup lang="ts">
import type { IndicatorTag } from '../../model/indicator'

defineProps({
  tag: {
    type: Object as () => IndicatorTag,
    default: undefined
  }
})
</script>

<template>
  <p v-if="tag" :class="['fr-badge', `fr-badge--${tag.color}`]">
    {{ tag.value }}
  </p>
  <p v-else class="fr-mb-0">-</p>
</template>

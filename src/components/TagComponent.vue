<script setup lang="ts">
import type { ResolvedTag } from '@/model/tag'

defineProps({
  tag: {
    type: Object as () => ResolvedTag,
    default: null
  }
})
</script>

<template>
  <p v-if="tag" :class="['fr-badge', `fr-badge--${tag.color}`]">
    {{ tag.name }}
  </p>
</template>

<style scoped>
.fr-badge {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: inherit;
  text-transform: none;
  font-size: 0.75rem;
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-weight: 400;
}
</style>

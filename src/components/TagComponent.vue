<script setup lang="ts">
import type { ResolvedTag } from '@/model/tag'

defineProps({
  tag: {
    type: Object as () => ResolvedTag,
    default: null
  },
  outlined: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <p
    v-if="tag"
    :class="[
      'fr-badge',
      `fr-badge--${tag.color}`,
      { 'fr-badge--outlined': outlined }
    ]"
    :style="
      outlined
        ? { '--tag-border-color': `var(--border-action-low-${tag.color})` }
        : undefined
    "
  >
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
.fr-badge--outlined {
  background-color: var(--background-default-grey);
  color: var(--text-default-grey);
  box-shadow: inset 0 0 0 1px var(--tag-border-color);
}
</style>

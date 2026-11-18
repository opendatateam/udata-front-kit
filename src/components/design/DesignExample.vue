<script setup lang="ts">
defineProps<{
  label: string
  // half width on medium screens and up, for vertical cards
  narrow?: boolean
}>()
</script>

<template>
  <li :class="['fr-col-12', { 'fr-col-md-6': narrow }]">
    <p class="design-example__label fr-text--sm fr-mb-2w">{{ label }}</p>
    <slot />
  </li>
</template>

<style scoped>
.design-example__label {
  color: var(--text-mention-grey);
}
</style>

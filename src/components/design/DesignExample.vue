<script setup lang="ts">
defineProps<{
  label: string
  // half width on medium screens and up, for vertical cards
  narrow?: boolean
}>()
</script>

<template>
  <li :class="['design-example', 'fr-col-12', { 'fr-col-md-6': narrow }]">
    <p class="design-example__label fr-text--sm fr-mb-2w">{{ label }}</p>
    <div>
      <slot />
    </div>
  </li>
</template>

<style scoped>
/* cards with `height: 100%` must resolve it against their own row, without the label */
.design-example {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr;
}

.design-example__label {
  color: var(--text-mention-grey);
}
</style>

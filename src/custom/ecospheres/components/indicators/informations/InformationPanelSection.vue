<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: undefined
  }
})
</script>

<template>
  <div class="fr-py-2w">
    <h3 v-if="title" class="subtitle subtitle--uppercase fr-mb-2w">
      {{ title }}
    </h3>
    <p v-if="$slots.description"><slot name="description" /></p>
    <dl class="fr-p-0 fr-grid-row fr-grid-row--gutters">
      <slot />
    </dl>
    <slot name="description-below" />
  </div>
</template>

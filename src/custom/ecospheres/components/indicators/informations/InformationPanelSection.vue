<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: undefined
  },
  // matches the smaller, muted text style used by @datagouv/components-next's
  // DatasetInformationSection (e.g. on dataset/dataservice info tabs)
  small: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="fr-py-2w">
    <h3
      v-if="title"
      :class="
        small
          ? 'uppercase text-sm text-gray-plain font-bold mb-1'
          : 'subtitle subtitle--uppercase fr-mb-2w'
      "
    >
      {{ title }}
    </h3>
    <p v-if="$slots.description"><slot name="description" /></p>
    <dl class="fr-p-0 fr-grid-row fr-grid-row--gutters">
      <slot />
    </dl>
    <slot name="description-below" />
  </div>
</template>

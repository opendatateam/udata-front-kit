<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: '-'
  },
  isRow: {
    type: Boolean,
    default: false
  }
})

const _class = props.isRow
  ? ['fr-col-12']
  : ['fr-col-12', 'fr-col-sm-6', 'fr-col-md-4']
</script>

<template>
  <div :class="_class">
    <h3 class="subtitle fr-mb-2v">{{ title }}</h3>
    <slot v-if="$slots.default"></slot>
    <p v-else class="fr-m-0">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Property } from 'csstype'

defineProps({
  name: {
    type: String,
    required: true
  },
  small: {
    type: Boolean,
    default: false
  },
  align: {
    type: String as () => Property.VerticalAlign,
    default: ''
  }
})
</script>

<template>
  <span
    :class="`fr-icon-custom fr-icon-${name} ${small ? 'sm' : ''}${align ? 'align' : ''}`"
    aria-hidden="true"
  ></span>
</template>

<style scoped>
.fr-icon-custom.align::before {
  vertical-align: v-bind(align);
}
.fr-icon-custom:not([class*='fr-icon--'])::before {
  --icon-size: 1.25rem;
}
.fr-icon-custom.sm:not([class*='fr-icon--'])::before {
  --icon-size: 0.9rem;
}
</style>

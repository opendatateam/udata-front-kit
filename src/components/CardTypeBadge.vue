<script setup lang="ts">
import type { Component } from 'vue'

import VIconRi from '@/components/VIconRi.vue'

defineProps<{
  // no badge is rendered when label is empty
  label?: string
  icon?: Component
}>()
</script>

<template>
  <!-- overlays a type badge on top of the wrapped card -->
  <div class="card-type-badge-wrapper">
    <p
      v-if="label"
      class="fr-badge fr-badge--sm fr-badge--mention-grey card-type-badge"
    >
      <VIconRi v-if="icon" :icon="icon" small class="fr-mr-1v" />
      {{ label }}
    </p>
    <slot />
  </div>
</template>

<style scoped>
.card-type-badge-wrapper {
  position: relative;
}

.card-type-badge {
  position: absolute;
  top: 0;
  left: 0.5rem;
  transform: translateY(-50%);
  z-index: 1;
  /* stronger contrast than DSFR's default mention-grey */
  background-color: #cecece;
  color: var(--text-default-grey) !important;
}
</style>

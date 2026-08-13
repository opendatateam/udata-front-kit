<script setup lang="ts">
import type { Property } from 'csstype'
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    icon: Component
    small?: boolean
    align?: Property.VerticalAlign
  }>(),
  {
    small: false,
    align: ''
  }
)
</script>

<template>
  <component
    :is="icon"
    aria-hidden="true"
    :class="['v-icon-ri', { 'v-icon-ri--sm': small }]"
    :style="align ? { verticalAlign: align } : undefined"
  />
</template>

<style scoped>
.v-icon-ri {
  --icon-size: 1.25rem;
  width: var(--icon-size);
  height: var(--icon-size);
}
.v-icon-ri--sm {
  --icon-size: 0.9rem;
}
</style>

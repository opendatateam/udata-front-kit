<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="fr-py-3w fr-mb-3w border-bottom border-default-grey">
    <h2 class="subtitle subtitle--uppercase">{{ title }}</h2>
    <p><slot name="description"></slot></p>
    <div class="fr-m-0">
      <div class="fr-grid-row fr-grid-row--gutters">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

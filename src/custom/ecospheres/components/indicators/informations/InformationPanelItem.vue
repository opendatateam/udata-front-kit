<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: '-'
  }
})
</script>

<template>
  <div class="fr-col-12 fr-col-sm-6 fr-col-md-4">
    <h3 class="subtitle fr-mb-2v">{{ title }}</h3>
    <p class="fr-m-0">{{ value }}</p>
  </div>
</template>

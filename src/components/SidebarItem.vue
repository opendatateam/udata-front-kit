<script setup lang="ts">
defineProps<{ term: string; id?: string }>()
</script>

<template>
  <div class="sidebar-item">
    <dt :id="id" class="fr-mb-1v fr-p-0 text-sm font-bold">{{ term }}</dt>
    <dd class="fr-p-0"><slot /></dd>
  </div>
</template>

<style scoped>
.sidebar-item + .sidebar-item {
  margin-top: 0.75rem; /* fr-mt-3v */
}
</style>

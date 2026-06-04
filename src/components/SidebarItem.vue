<script setup lang="ts">
defineProps<{ term: string; id?: string }>()
</script>

<template>
  <div>
    <dt :id="id" class="fr-mb-1v fr-p-0 text-sm font-bold">{{ term }}</dt>
    <dd class="fr-p-0"><slot /></dd>
  </div>
</template>

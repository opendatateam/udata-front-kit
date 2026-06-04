<script setup lang="ts">
defineProps<{ term: string; id?: string }>()
</script>

<template>
  <div>
    <dt :id="id" class="mb-1 p-0 text-sm font-bold">{{ term }}</dt>
    <dd class="p-0"><slot /></dd>
  </div>
</template>

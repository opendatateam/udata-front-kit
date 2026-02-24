<template>
  <div class="fr-grid-row flex-direction-column fr-grid-row--middle fr-mt-5w">
    <img :src="image" alt="" loading="lazy" height="105" width="130" />
    <p class="fr-h6 fr-mt-2w fr-mb-5v text-center">
      {{ message }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image: string
  message: string
}>()
</script>

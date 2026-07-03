<template>
  <figure class="fr-my-2w">
    <img :src="src" :alt="alt" class="article-screenshot" />
    <figcaption class="fr-text--sm fr-mt-1w caption-grey">
      <slot />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  src: string
  alt: string
}>()
</script>

<style scoped>
.article-screenshot {
  width: 100%;
  height: auto;
  display: block;
  border: 1px solid var(--border-default-grey);
  border-radius: var(--radius-default);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.caption-grey {
  color: var(--text-mention-grey);
}
</style>

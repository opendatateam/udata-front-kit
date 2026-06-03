<template>
  <div class="fr-tile fr-enlarge-link folder-card">
    <div class="fr-tile__body">
      <div class="fr-tile__content">
        <h3 class="fr-tile__title">
          <RouterLink :to="to">{{ title }}</RouterLink>
        </h3>
        <p class="fr-tile__desc">{{ description }}</p>
        <p class="fr-tile__detail">
          {{ articleCount }}&nbsp;{{ articleCount > 1 ? 'articles' : 'article' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  to: string
  articleCount: number
}>()
</script>

<style scoped>
.folder-card {
  height: 100%;
}
</style>

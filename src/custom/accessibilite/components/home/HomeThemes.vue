<script lang="ts" setup>
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { useUniverseQuery } from '@/utils/universe'

import { DsfrTile } from '@gouvminint/vue-dsfr'

const topicsAPI = new TopicsAPI()
const topics = ref<Topic[] | null>(null)

onMounted(async () => {
  const response = await topicsAPI.list({
    params: { ...useUniverseQuery('themes', {}), page: 1, page_size: 8 }
  })
  topics.value = response.data
})

const themeIcon = (tags: string[]) => {
  const theme = tags[1].split('-').at(-1)
  return theme
}
</script>

<template>
  <section class="fr-background-alt--yellow-moutarde fr-py-7w">
    <div class="fr-container">
      <h2>Explorer par thème</h2>
      <ul v-if="topics" class="themes-list" role="list">
        <li v-for="topic in topics" :key="topic.id">
          <DsfrTile
            class="theme-tile"
            :title="topic.name"
            :description="topic.description"
            :details="`${topic.elements.total} jeux de données`"
            :img-src="`/static/accessibilite/assets/icons/icon-theme-${themeIcon(topic.tags)}.svg`"
            :to="{
              name: 'themes_detail',
              params: { item_id: topic.slug }
            }"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.themes-list {
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 1.75rem;
}
.theme-tile {
  block-size: 100%;
}
</style>

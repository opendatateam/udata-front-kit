<script setup lang="ts">
import { onMounted, computed, type ComputedRef } from 'vue'

import { useTopicStore } from '@/store/TopicStore'

import config from '../config'
import type { Theme } from '../model/theme'
import Tile from './Tile.vue'

const topicStore = useTopicStore()

const getCustomBoxShadow = (color: string) => {
  return `box-shadow: rgb(221, 221, 221) 0px 0px 0px 1px inset, #${color} 0px -4px 0px 0px inset`
}

const getThemeDescription = (theme: Theme) => {
  const nbBouquets = topicStore.data.filter((topic) => {
    return !topic.private && topic.extras.ecospheres.theme === theme.name
  }).length
  switch (nbBouquets) {
    case 0:
      return 'Aucun bouquet'
    case 1:
      return '1 bouquet'
    default:
      return `${nbBouquets} bouquets`
  }
}

const themesWithDescriptions: ComputedRef<Array<[Theme, string]>> = computed(
  () => {
    return config.themes.map((theme: Theme) => {
      return [theme, getThemeDescription(theme)]
    })
  }
)

onMounted(() => {
  topicStore.loadTopicsForUniverse()
})
</script>

<template>
  <div class="fr-container--fluid">
    <ul
      class="fr-grid-row fr-grid-row--gutters es__tiles__list home-themes-tiles"
    >
      <li
        v-for="[theme, description] in themesWithDescriptions"
        :key="theme.name"
        class="fr-col-12 fr-col-lg-3"
      >
        <Tile
          :style="getCustomBoxShadow(theme.color)"
          :link="{ name: 'bouquets', query: { theme: theme.name } }"
          :title="theme.name"
          :description="description"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.home-themes-tiles {
  .fr-tile__body {
    align-items: flex-start;
  }
}
</style>

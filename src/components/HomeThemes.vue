<script setup lang="ts">
import config from '../config'
import type { Theme } from '../model'
import Tile from './Tile.vue'

const getCustomBoxShadow = (color: string) => {
  return `box-shadow: rgb(221, 221, 221) 0px 0px 0px 1px inset, #${color} 0px -4px 0px 0px inset`
}

const getThemeDescription = (theme: Theme): string => {
  const nbSubthemes = theme.subthemes.length
  switch (nbSubthemes) {
    case 0:
      return 'Pas de chantiers'
    case 1:
      return '1 chantier'
    default:
      return nbSubthemes + ' chantiers'
  }
}
</script>

<template>
  <div class="fr-container--fluid">
    <ul
      class="fr-grid-row fr-grid-row--gutters es__tiles__list home-themes-tiles"
    >
      <li
        v-for="theme in config.themes"
        :key="theme.name"
        class="fr-col-12 fr-col-lg-3"
      >
        <Tile
          :style="getCustomBoxShadow(theme.color)"
          :link="{ name: 'bouquets', query: { theme: theme.name } }"
          :title="theme.name"
          :description="getThemeDescription(theme)"
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

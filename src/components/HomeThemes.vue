<template>
  <div className="without_breadcrumb" v-if="selectedTheme === null">
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-mt-1w">
      <li v-for="theme in themeList" class="fr-col-12 fr-col-lg-4">
        <Tile
          :style="getCustomBoxShadow(theme.color)"
          :link="`/?theme=${theme.name}`"
          :title="theme.name"
          :description="getThemeDescription(theme)"
        />
      </li>
    </ul>
  </div>
  <div v-else>
    <DsfrBreadcrumb class="breadcrumb" :links="breadcrumbList" />
    <div class="with_breadcrumb">
      <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-mt-1w">
        <li
          v-for="subtheme in selectedTheme.subthemes"
          class="fr-col-12 fr-col-lg-4"
        >
          <Tile
            :style="getCustomBoxShadow(selectedTheme.color)"
            :link="goToTopicList(subtheme)"
            :title="subtheme.name"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import config from '../config'
import type { Theme, Subtheme } from '../model'
import Tile from './Tile.vue'

export default {
  name: 'HomeThemes',
  components: {
    Tile
  },
  props: {
    selectedThemeName: {
      type: String
    }
  },
  computed: {
    selectedTheme() {
      for (const theme of this.themeList) {
        if (theme.name === this.selectedThemeName) {
          return theme
        }
      }
      return null
    },
    themeList() {
      return config.themes
    },
    breadcrumbList() {
      return [{ text: 'Accueil', to: '/' }, { text: this.selectedTheme.name }]
    }
  },
  methods: {
    getCustomBoxShadow(color: string) {
      return `box-shadow: rgb(221, 221, 221) 0px 0px 0px 1px inset, #${color} 0px -4px 0px 0px inset`
    },
    goToTopicList(subtheme: Subtheme): string {
      return `/bouquets/?theme=${this.selectedTheme.name}&subtheme=${subtheme.name}`
    },
    getThemeDescription(theme: Theme): string {
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
  }
}
</script>

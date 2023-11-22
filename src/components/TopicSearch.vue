<template>
  <div className="filterForm">
    <div class="fr-select-group">
      <label class="fr-label" for="select_theme"> Thématiques </label>
      <select class="fr-select" id="select_theme" @change="switchTheme($event)">
        <option
          :value="this.NoOptionSelected"
          :selected="themeName == this.NoOptionSelected"
        >
          Choisir une thématique
        </option>
        <option
          v-for="option in themeOptions"
          :value="option.value"
          :selected="option.value === themeName"
        >
          {{ option.text }}
        </option>
      </select>
    </div>

    <div class="fr-select-group">
      <label class="fr-label" for="select_subtheme"> Chantiers </label>
      <select
        class="fr-select"
        id="select_subtheme"
        @change="switchSubtheme($event)"
      >
        <option
          :value="this.NoOptionSelected"
          :selected="subthemeName == this.NoOptionSelected"
        >
          Choisir un chantier
        </option>
        <option
          v-for="option in subthemeOptions"
          v-bind:value="option.value"
          :selected="option.value === subthemeName"
        >
          {{ option.text }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import config from '../config'
import { NoOptionSelected, SelectOption } from '../model'
import Tile from './Tile.vue'

export default defineComponent({
  name: 'TopicSearch',
  components: {
    Tile: Tile
  },
  created() {
    this.NoOptionSelected = NoOptionSelected
  },
  props: {
    themeName: {
      type: String,
      default: NoOptionSelected
    },
    subthemeName: {
      type: String,
      default: NoOptionSelected
    }
  },
  computed: {
    selectedTheme() {
      for (const theme of this.themeList) {
        if (theme.name === this.themeName) {
          return theme
        }
      }
      return null
    },
    themeList() {
      return config.themes
    },
    themeOptions(): SelectOption[] {
      const options: SelectOption[] = []
      for (const theme of this.themeList) {
        options.push({
          value: theme.name,
          text: theme.name
        })
      }
      return options
    },
    subthemeOptions(): SelectOption[] {
      const options: SelectOption[] = []
      if (this.selectedTheme) {
        for (const subtheme of this.selectedTheme.subthemes) {
          options.push({
            value: subtheme.name,
            text: subtheme.name
          })
        }
      }
      return options
    }
  },
  methods: {
    switchTheme(event) {
      this.$router.push({
        path: '/bouquets',
        query: { theme: event.target.value, subtheme: NoOptionSelected }
      })
    },
    switchSubtheme(event) {
      this.$router.push({
        path: '/bouquets',
        query: { theme: this.themeName, subtheme: event.target.value }
      })
    }
  }
})
</script>

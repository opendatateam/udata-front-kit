<template>
  <div className="filterForm">
    <div class="fr-select-group">
      <label class="fr-label" for="select_theme"> Thématiques </label>
      <select class="fr-select" id="select_theme" @change="switchTheme($event)">
        <option
          :value="NoOptionSelected"
          :selected="themeName == NoOptionSelected"
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
          :value="NoOptionSelected"
          :selected="subthemeName == NoOptionSelected"
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

import { ConfigUtils } from '@/config'
import { NoOptionSelected } from '@/model'
import type { SelectOption, Theme } from '@/model'

export default defineComponent({
  name: 'TopicSearch',
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
    selectedTheme(): Theme | null {
      return ConfigUtils.getThemeByName(this.themeName)
    },
    themeOptions(): SelectOption[] {
      return ConfigUtils.getThemeOptions()
    },
    subthemeOptions(): SelectOption[] {
      return this.selectedTheme
        ? ConfigUtils.getSubthemeOptions(this.selectedTheme)
        : []
    },
    NoOptionSelected() {
      return NoOptionSelected
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

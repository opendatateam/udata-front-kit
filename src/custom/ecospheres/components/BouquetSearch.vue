<template>
  <div className="filterForm">
    <DsfrCheckbox
      v-if="userStore.isLoggedIn"
      v-model="showDrafts"
      label="Afficher les brouillons"
      name="show_drafts"
    />

    <div class="fr-select-group">
      <label class="fr-label" for="select_theme"> Thématiques </label>
      <select id="select_theme" class="fr-select" @change="switchTheme($event)">
        <option
          :value="NoOptionSelected"
          :selected="themeName == NoOptionSelected"
        >
          Choisir une thématique
        </option>
        <option
          v-for="option in themeOptions"
          :key="option.value"
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
        id="select_subtheme"
        class="fr-select"
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
          :key="option.value"
          :value="option.value"
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
import { useUserStore } from '@/store/UserStore'

export default defineComponent({
  name: 'BouquetSearch',
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
  emits: ['update:showDrafts'],
  data: () => {
    return {
      showDrafts: false,
      userStore: useUserStore()
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
  watch: {
    showDrafts(newVal) {
      this.$emit('update:showDrafts', newVal)
    }
  },
  methods: {
    switchTheme(event: Event) {
      this.$router.push({
        path: '/bouquets',
        query: {
          theme: (event.target as HTMLInputElement)?.value,
          subtheme: NoOptionSelected
        }
      })
    },
    switchSubtheme(event: Event) {
      this.$router.push({
        path: '/bouquets',
        query: {
          theme: this.themeName,
          subtheme: (event.target as HTMLInputElement)?.value
        }
      })
    }
  }
})
</script>

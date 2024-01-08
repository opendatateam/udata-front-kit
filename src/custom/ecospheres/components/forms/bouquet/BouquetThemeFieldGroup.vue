<template>
  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_theme"> Thématique</label>
    <select id="select_theme" class="fr-select" @change="switchTheme($event)">
      <option :value="NoOptionSelected" :selected="theme == NoOptionSelected">
        Choisir une thématique
      </option>
      <option
        v-for="option in themeOptions"
        :key="option.value"
        :value="option.value"
        :selected="option.value === theme"
      >
        {{ option.text }}
      </option>
    </select>
  </div>

  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_subtheme"> Chantier</label>
    <select
      id="select_subtheme"
      class="fr-select"
      :disabled="theme === NoOptionSelected"
      @change="switchSubtheme($event)"
    >
      <option
        :value="NoOptionSelected"
        :selected="subtheme == NoOptionSelected"
      >
        Choisir un chantier
      </option>
      <option
        v-for="option in subthemeOptions"
        :key="option.value"
        :value="option.value"
        :selected="option.value === subtheme"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { ConfigUtils } from '@/config'
import { NoOptionSelected, type SelectOption, type Theme } from '@/model'

export default {
  name: 'BouquetThemeFieldGroup',
  props: {
    theme: {
      type: String,
      default: NoOptionSelected
    },
    subtheme: {
      type: String,
      default: NoOptionSelected
    }
  },
  emits: ['updateValidation', 'update:theme', 'update:subtheme'],
  computed: {
    isValid() {
      return (
        this.theme !== NoOptionSelected && this.subtheme !== NoOptionSelected
      )
    },
    errorMsg() {
      return ''
    },
    selectedTheme(): Theme | null {
      return ConfigUtils.getThemeByName(this.theme)
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
    isValid(newValue) {
      this.$emit('updateValidation', newValue)
    }
  },
  methods: {
    switchTheme(event: Event) {
      this.$emit('update:theme', (event.target as HTMLSelectElement).value)
    },
    switchSubtheme(event: Event) {
      this.$emit('update:subtheme', (event.target as HTMLSelectElement).value)
    }
  }
}
</script>

<template>
  <section class="fr-col-12 fr-col-lg-7">
    <div class="fr-select-group fr-mt-1w">
      <label class="fr-label" for="select_theme"> Thématiques </label>
      <select class="fr-select" id="select_theme" @change="switchTheme($event)">
        <option :value="NoOptionSelected" :selected="theme == NoOptionSelected">
          Choisir une thématique
        </option>
        <option
          v-for="option in themeOptions"
          :value="option.value"
          :selected="option.value === theme"
        >
          {{ option.text }}
        </option>
      </select>
    </div>

    <div class="fr-select-group fr-mt-1w">
      <label class="fr-label" for="select_subtheme"> Chantiers </label>
      <select
        class="fr-select"
        id="select_subtheme"
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
          v-bind:value="option.value"
          :selected="option.value === subtheme"
        >
          {{ option.text }}
        </option>
      </select>
    </div>
  </section>
</template>

<script lang="ts">
import { ConfigUtils } from '@/config'
import { NoOptionSelected, type SelectOption, type Theme } from '@/model'

export default {
  name: 'TopicThemeFieldGroup',
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
  watch: {
    isValid(newValue) {
      this.$emit('updateValidation', newValue)
    }
  },
  computed: {
    isValid() {
      return true
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
  methods: {
    switchTheme(event) {
      this.$emit('update:theme', event.target.value)
    },
    switchSubtheme(event) {
      this.$emit('update:subtheme', event.target.value)
    }
  }
}
</script>

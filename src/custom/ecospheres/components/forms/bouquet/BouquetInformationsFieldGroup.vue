<script setup lang="ts">
import { computed, watch } from 'vue'

import { ConfigUtils } from '@/config'
import { NoOptionSelected, type SelectOption, type Theme } from '@/model'

const props = defineProps({
  theme: {
    type: String,
    default: NoOptionSelected
  },
  subtheme: {
    type: String,
    default: NoOptionSelected
  }
})

const emit = defineEmits([
  'updateValidation',
  'update:theme',
  'update:subtheme'
])

const isValid = computed(() => {
  return props.theme !== NoOptionSelected && props.subtheme !== NoOptionSelected
})

const selectedTheme = computed((): Theme | null => {
  return ConfigUtils.getThemeByName(props.theme)
})

const themeOptions = computed((): SelectOption[] => {
  return ConfigUtils.getThemeOptions()
})

const subthemeOptions = computed((): SelectOption[] => {
  return selectedTheme.value
    ? ConfigUtils.getSubthemeOptions(selectedTheme.value)
    : []
})

const switchTheme = (event: Event) => {
  emit('update:theme', (event.target as HTMLSelectElement).value)
  emit('update:subtheme', NoOptionSelected)
}

const switchSubtheme = (event: Event) => {
  emit('update:subtheme', (event.target as HTMLSelectElement).value)
}

watch(
  isValid,
  (newValue) => {
    emit('updateValidation', newValue)
  },
  { immediate: true }
)
</script>

<template>
  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_theme">Thématique</label>
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
    <label class="fr-label" for="select_subtheme">Chantier</label>
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

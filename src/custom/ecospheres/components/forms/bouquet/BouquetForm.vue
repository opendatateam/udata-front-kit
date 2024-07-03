<script setup lang="ts">
import { defineModel, computed, ref, onMounted, watch } from 'vue'

import { updateEcospheresExtras } from '@/custom/ecospheres/utils/bouquet'
import type { SpatialCoverage } from '@/model/spatial'
import { NoOptionSelected } from '@/model/theme'
import type { Topic } from '@/model/topic'
import { useSpatialCoverage } from '@/utils/spatial'
import { useThemeOptions } from '@/utils/theme'

import SelectSpatialCoverage from '../SelectSpatialCoverage.vue'

const topic = defineModel({
  type: Object as () => Topic,
  required: true
})

const emits = defineEmits(['updateValidation'])

const spatialCoverage = useSpatialCoverage(topic)

const theme = ref(NoOptionSelected)
const subtheme = ref(NoOptionSelected)

const isValid = computed(() => {
  return (
    topic.value.name &&
    topic.value.name.trim() !== '' &&
    topic.value.description &&
    topic.value.description.trim() !== '' &&
    topic.value.extras &&
    topic.value.extras.ecospheres.theme !== NoOptionSelected &&
    topic.value.extras.ecospheres.subtheme !== NoOptionSelected
  )
})

const { themeOptions, subthemeOptions } = useThemeOptions(theme)

const switchTheme = (event: Event) => {
  theme.value = (event.target as HTMLSelectElement).value
  subtheme.value = NoOptionSelected
}

const switchSubtheme = (event: Event) => {
  subtheme.value = (event.target as HTMLSelectElement).value
}

const onUpdateSpatialCoverage = (value: SpatialCoverage | undefined) => {
  const zones = value === undefined ? null : [value.id]
  topic.value.spatial = { ...topic.value.spatial, zones }
}

// sync theme and subtheme from local refs to topic
watch([theme, subtheme], () => {
  topic.value.extras = updateEcospheresExtras(topic.value, {
    theme: theme.value,
    subtheme: subtheme.value
  })
})

// sync validation state with parent component
watch(
  isValid,
  () => {
    emits('updateValidation', isValid.value)
  },
  { immediate: true }
)

// initialize theme and subtheme from topic values, if any
onMounted(() => {
  theme.value = topic.value.extras.ecospheres.theme
  subtheme.value = topic.value.extras.ecospheres.subtheme
})
</script>

<template>
  <!-- Title -->
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="bouquet_name"
      >Sujet du bouquet <span class="required">&nbsp;*</span></label
    >
    <input
      id="bouquet_name"
      v-model="topic.name"
      class="fr-input"
      type="text"
      placeholder="Mon bouquet"
    />
  </div>
  <!-- Description -->
  <div class="fr-mt-1w">
    <div>Objectif du bouquet<span class="required">&nbsp;*</span></div>
    <div>
      Utilisez du
      <a target="_blank" href="https://www.markdownguide.org/cheat-sheet/"
        >markdown</a
      >
      pour mettre en forme votre texte
    </div>
    <textarea
      id="bouquet_description"
      v-model="topic.description"
      class="fr-input"
      type="text"
      placeholder="Renseignez ici les informations nécessaires à la compréhension du bouquet : politique publique et problématique à laquelle il répond, lien vers toute méthodologie de traitement des données, description de l'organisme porteur du projet, etc."
    />
  </div>
  <!-- Theme -->
  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_theme"
      >Thématique <span class="required">&nbsp;*</span></label
    >
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
  <!-- Subtheme -->
  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_subtheme"
      >Chantier <span class="required">&nbsp;*</span></label
    >
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
  <!-- Spatial coverage -->
  <div class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select-spatial-coverage"
      >Couverture territoriale</label
    >
    <SelectSpatialCoverage
      v-model="spatialCoverage"
      @update:model-value="onUpdateSpatialCoverage"
    />
  </div>
</template>

<script setup lang="ts">
import { defineModel, computed, ref, onMounted, watch, capitalize } from 'vue'

import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import type { SpatialCoverage } from '@/model/spatial'
import { NoOptionSelected } from '@/model/theme'
import type { Topic } from '@/model/topic'
import { updateTopicExtras } from '@/utils/bouquet'
import { useTopicsConf } from '@/utils/config'
import { useSpatialCoverage } from '@/utils/spatial'
import { useThemeOptions } from '@/utils/theme'

const topic = defineModel({
  type: Object as () => Topic,
  required: true
})

const emits = defineEmits(['updateValidation'])

const spatialCoverage = useSpatialCoverage(topic)
const {
  topicsUseThemes,
  topicsExtrasKey,
  topicsMainTheme,
  topicsSecondaryTheme,
  topicsName,
  topicsSlug
} = useTopicsConf()

const theme = ref(NoOptionSelected)
const subtheme = ref(NoOptionSelected)

const isValid = computed(() => {
  const isValidWithoutThemes =
    topic.value.name &&
    topic.value.name.trim() !== '' &&
    topic.value.description &&
    topic.value.description.trim() !== ''

  if (!topicsUseThemes) return isValidWithoutThemes

  return (
    isValidWithoutThemes &&
    topic.value.extras &&
    topic.value.extras[topicsExtrasKey].theme !== NoOptionSelected &&
    topic.value.extras[topicsExtrasKey].subtheme !== NoOptionSelected
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
  topic.value.extras = updateTopicExtras(topic.value, {
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
  theme.value = topic.value.extras[topicsExtrasKey].theme
  subtheme.value = topic.value.extras[topicsExtrasKey].subtheme
})
</script>

<template>
  <!-- Title -->
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" :for="`${topicsSlug}_name`">
      <span>Sujet du {{ topicsName }}&nbsp;*</span>
    </label>
    <input
      :id="`${topicsSlug}_name`"
      v-model="topic.name"
      class="fr-input"
      required
      type="text"
    />
  </div>
  <!-- Description -->
  <div class="fr-mt-1w">
    <label :for="`${topicsSlug}_description`">
      <span>Objectif du {{ topicsName }}&nbsp;*</span>
    </label>
    <p id="description-instructions" class="fr-mt-1v">
      Renseignez ici les informations nécessaires à la compréhension du
      {{ topicsName }}&nbsp;: politique publique et problématique à laquelle il
      répond, lien vers toute méthodologie de traitement des données,
      description de l'organisme porteur du projet, etc.<br />
      Utilisez du
      <a target="_blank" href="https://www.markdownguide.org/cheat-sheet/"
        >markdown (guide en anglais)</a
      >
      pour mettre en forme votre texte.
    </p>
    <textarea
      :id="`${topicsSlug}_description`"
      v-model="topic.description"
      class="fr-input"
      required
      aria-describedby="description-instructions"
    />
  </div>
  <!-- Theme -->
  <div v-if="topicsUseThemes" class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_theme">
      {{ capitalize(topicsMainTheme) }}&nbsp;*
    </label>
    <select
      id="select_theme"
      class="fr-select"
      required
      @change="switchTheme($event)"
    >
      <option
        :value="NoOptionSelected"
        :selected="theme == NoOptionSelected"
        disabled
        hidden
      >
        --Choisir une {{ topicsMainTheme }}--
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
  <div v-if="topicsUseThemes" class="fr-select-group fr-mt-1w">
    <label class="fr-label" for="select_subtheme"
      >{{ capitalize(topicsSecondaryTheme) }}
      &nbsp;*
    </label>
    <select
      id="select_subtheme"
      class="fr-select"
      required
      @change="switchSubtheme($event)"
    >
      <option
        :value="NoOptionSelected"
        :selected="subtheme == NoOptionSelected"
        disabled
        hidden
      >
        <span v-if="theme === NoOptionSelected"
          >--Choisissez d'abord une {{ topicsMainTheme }}--</span
        >
        <span v-else>--Choisir un {{ topicsSecondaryTheme }}--</span>
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

<style scoped>
label {
  font-weight: bold;
}
</style>

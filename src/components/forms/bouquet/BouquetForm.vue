<script setup lang="ts">
import { defineModel, computed, ref, onMounted, watch } from 'vue'

import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import config from '@/config'
import type { SpatialCoverage } from '@/model/spatial'
import { NoOptionSelected } from '@/model/theme'
import type { Topic } from '@/model/topic'
import { updateTopicPropertiesExtras } from '@/utils/bouquet'
import { useSpatialCoverage } from '@/utils/spatial'
import { useThemeOptions } from '@/utils/theme'

const topic = defineModel({
  type: Object as () => Topic,
  required: true
})

const emits = defineEmits(['updateValidation'])

const spatialCoverage = useSpatialCoverage(topic)

const extrasToProcess = config.website.topics.extras_to_process
const useThemes = ref(config.website.topics.themes.usage)
const mainTheme = ref(config.website.topics.themes.main_name)
const secondaryTheme = ref(config.website.topics.themes.secondary_name)

const topicName = ref(config.website.topics.topic_name.name)
const topicSlug = ref(config.website.topics.topic_name.slug)

const theme = ref(NoOptionSelected)
const subtheme = ref(NoOptionSelected)

const isValid = computed(() => {
  if (useThemes.value) {
    return (
      topic.value.name &&
      topic.value.name.trim() !== '' &&
      topic.value.description &&
      topic.value.description.trim() !== '' &&
      topic.value.extras &&
      topic.value.extras[extrasToProcess].theme !== NoOptionSelected &&
      topic.value.extras[extrasToProcess].subtheme !== NoOptionSelected
    )
  } else {
    return (
      topic.value.name &&
      topic.value.name.trim() !== '' &&
      topic.value.description &&
      topic.value.description.trim() !== ''
    )
  }
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
  topic.value.extras = updateTopicPropertiesExtras(
    topic.value,
    {
      theme: theme.value,
      subtheme: subtheme.value
    },
    extrasToProcess
  )
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
  theme.value = topic.value.extras[extrasToProcess].theme
  subtheme.value = topic.value.extras[extrasToProcess].subtheme
})
</script>

<template>
  <!-- Title -->
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" :for="topicSlug + '_name'"
      >Sujet du {{ topicName }} <span class="required">&nbsp;*</span></label
    >
    <input
      :id="topicSlug + '_name'"
      v-model="topic.name"
      class="fr-input"
      type="text"
      :placeholder="'Mon ' + topicName"
    />
  </div>
  <!-- Description -->
  <div class="fr-mt-1w">
    <div>Objectif du {{ topicName }}<span class="required">&nbsp;*</span></div>
    <div>
      Utilisez du
      <a target="_blank" href="https://www.markdownguide.org/cheat-sheet/"
        >markdown</a
      >
      pour mettre en forme votre texte
    </div>
    <textarea
      :id="topicSlug + '_description'"
      v-model="topic.description"
      class="fr-input"
      type="text"
      :placeholder="
        'Renseignez ici les informations nécessaires à la compréhension du ' +
        topicName +
        ': politique publique et problématique à laquelle il répond, lien vers toute méthodologie de traitement des données, description de l\'organisme porteur du projet, etc.'
      "
    />
  </div>
  <!-- Theme -->
  <div class="fr-select-group fr-mt-1w" v-if="useThemes">
    <label class="fr-label" for="select_theme"
      >{{ mainTheme }} <span class="required">&nbsp;*</span></label
    >
    <select id="select_theme" class="fr-select" @change="switchTheme($event)">
      <option :value="NoOptionSelected" :selected="theme == NoOptionSelected">
        Choisir une {{ mainTheme }}
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
  <div class="fr-select-group fr-mt-1w" v-if="useThemes">
    <label class="fr-label" for="select_subtheme"
      >{{ secondaryTheme }} <span class="required">&nbsp;*</span></label
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
        Choisir un {{ secondaryTheme }}
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

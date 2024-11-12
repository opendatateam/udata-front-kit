<script setup lang="ts">
import type { DatasetProperties } from '@/model/topic'
import { useTopicsConf } from '@/utils/config'

const props = defineProps({
  datasetProperties: {
    type: Object as () => DatasetProperties,
    required: true
  }
})

const { topicsName } = useTopicsConf()

const emit = defineEmits(['update:datasetProperties'])

const updateDatasetProperties = (
  field: keyof DatasetProperties,
  value: string
) => {
  emit('update:datasetProperties', {
    ...props.datasetProperties,
    [field]: value
  })
}
</script>

<template>
  <div class="fr-input-group">
    <label class="fr-label" for="input-title"
      >Libellé du jeu de données (obligatoire)</label
    >
    <input
      id="input-title"
      class="fr-input"
      type="text"
      :value="props.datasetProperties.title"
      @input="
        updateDatasetProperties(
          'title',
          ($event.target as HTMLInputElement).value
        )
      "
    />
  </div>
  <div class="fr-input-group">
    <label class="fr-label" for="input-purpose"
      >Raison d'utilisation dans ce {{ topicsName }} (obligatoire)</label
    >
    <p id="purpose-description" class="fr-mt-1v fr-mb-2v fr-text--sm">
      Renseignez la raison d'utilisation de ce jeu de données, si celle-ci n'est
      pas évidente. Vous pouvez également utiliser cet espace pour renseigner
      des problèmes liés à l'accès ou la qualité des données.<br />
      Utilisez du
      <a target="_blank" href="https://www.markdownguide.org/cheat-sheet/"
        ><span lang="en">markdown</span> (guide en anglais)</a
      >
      pour mettre en forme votre texte.
    </p>
    <textarea
      id="input-purpose"
      class="fr-input"
      type="text"
      aria-describedby="purpose-description"
      :value="props.datasetProperties.purpose"
      @input="
        updateDatasetProperties(
          'purpose',
          ($event.target as HTMLTextAreaElement).value
        )
      "
    />
  </div>
</template>

<style scoped>
textarea {
  min-height: 150px;
}
</style>

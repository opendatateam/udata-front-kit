<script setup lang="ts">
import Tooltip from '@/components/TooltipWrapper.vue'
import config from '@/config'
import type { DatasetProperties } from '@/model/topic'

const props = defineProps({
  datasetProperties: {
    type: Object as () => DatasetProperties,
    required: true
  }
})

const topicName = config.website.topics.topic_name.name

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
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="label"
      >Libellé du jeu de données <span class="required">&nbsp;*</span></label
    >
    <input
      id="label"
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
  <div class="fr-mt-1w fr-mb-4w">
    <div class="container">
      Raison d'utilisation dans ce {{ topicName }}
      <span class="required">&nbsp;*</span>
      <Tooltip
        text="Renseignez la raison d'utilisation de ce jeu de données, si celle-ci n'est pas évidente. Vous pouvez également utiliser cet espace pour renseigner des problèmes liés à l'accès ou la qualité des données."
      />
    </div>
    <div class="container small">
      Vous pouvez utiliser du markdown pour mettre en forme votre texte
      <Tooltip
        text="* simple astérisque pour italique *<br/> ** double astérisque pour gras **<br/> # un dièse pour titre 1<br/> ## deux dièses pour titre 2<br/> *  astérisque pour une liste<br/> lien : [[https://exemple.fr]]"
      />
    </div>
    <textarea
      id="purpose"
      class="fr-input"
      type="text"
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

<style scoped lang="scss">
textarea {
  height: 150px;
}
</style>

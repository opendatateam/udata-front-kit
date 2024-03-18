<script setup lang="ts">
import Tooltip from '@/components/TooltipWrapper.vue'
import type { DatasetProperties } from '@/model'

const props = defineProps({
  datasetProperties: {
    type: Object as () => DatasetProperties,
    required: true
  }
})

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
      >Libellé de la donnée <span class="required">&nbsp;*</span></label
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
      Raison d'utilisation dans ce bouquet
      <span class="required">&nbsp;*</span>
      <Tooltip
        text="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
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

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps({
  bouquetName: {
    type: String,
    default: ''
  },
  bouquetDescription: {
    type: String,
    default: ''
  }
})

const emits = defineEmits([
  'updateValidation',
  'update:bouquetDescription',
  'update:bouquetName'
])

const isValid = computed(() => {
  return isComplete.value
})

const isComplete = computed(() => {
  return (
    props.bouquetName.trim() !== '' && props.bouquetDescription.trim() !== ''
  )
})

watch(
  isValid,
  (newValue) => {
    emits('updateValidation', newValue)
  },
  { immediate: true }
)
</script>

<template>
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="bouquet_name"
      >Sujet du bouquet <span class="required">&nbsp;*</span></label
    >
    <input
      id="bouquet_name"
      class="fr-input"
      type="text"
      placeholder="Mon bouquet"
      :value="bouquetName"
      @input="
        $emit('update:bouquetName', ($event.target as HTMLInputElement)?.value)
      "
    />
  </div>
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
      class="fr-input"
      type="text"
      placeholder="Renseignez ici les informations nécessaires à la compréhension du bouquet : politique publique et problématique à laquelle il répond, lien vers toute méthodologie de traitement des données, description de l'organisme porteur du projet, etc."
      :value="bouquetDescription"
      @input="
        $emit(
          'update:bouquetDescription',
          ($event.target as HTMLInputElement)?.value
        )
      "
    />
  </div>
</template>

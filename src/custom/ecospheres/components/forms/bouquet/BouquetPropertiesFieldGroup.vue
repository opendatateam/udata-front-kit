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
    <div>Objectif du bouquet <span class="required">&nbsp;*</span></div>
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
      placeholder="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
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

<script lang="ts">
export default {
  name: 'BouquetPropertiesFieldGroup',
  props: {
    bouquetName: {
      type: String,
      default: ''
    },
    bouquetDescription: {
      type: String,
      default: ''
    }
  },
  emits: [
    'updateValidation',
    'update:bouquetDescription',
    'update:bouquetName'
  ],
  computed: {
    isValid() {
      return (
        this.bouquetName.trim() !== '' && this.bouquetDescription.trim() !== ''
      )
    },
    errorMsg() {
      return ''
    }
  },
  watch: {
    isValid(newValue) {
      this.$emit('updateValidation', newValue)
    }
  }
}
</script>

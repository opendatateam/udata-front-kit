<template>
  <div class="fr-mt-1w fr-mb-4w">
    <label class="fr-label" for="bouquet_name">Sujet du bouquet</label>
    <input
      class="fr-input"
      type="text"
      id="bouquet_name"
      placeholder="Mon bouquet"
      :value="bouquetName"
      @input="$emit('update:bouquetName', $event.target.value)"
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
      class="fr-input"
      type="text"
      id="bouquet_description"
      placeholder="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
      :value="bouquetDescription"
      @input="$emit('update:bouquetDescription', $event.target.value)"
    />
  </div>
</template>

<script lang="ts">
import Tooltip from '@/components/Tooltip.vue'

export default {
  name: 'BouquetPropertiesFieldGroup',
  components: {
    Tooltip: Tooltip
  },
  emits: [
    'updateValidation',
    'update:bouquetDescription',
    'update:bouquetName'
  ],
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
  watch: {
    isValid(newValue) {
      this.$emit('updateValidation', newValue)
    }
  },
  computed: {
    isValid() {
      return this.bouquetName !== '' && this.bouquetDescription !== ''
    },
    errorMsg() {
      return ''
    }
  }
}
</script>

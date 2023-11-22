<template>
  <div class="app">
    <form @submit.prevent="handleSubmit" class="checkout-form">
      <h2>Ajout d'un dataset</h2>

      <div class="fr-mt-1w fr-mb-4w">
        <label class="fr-label" for="label">Libellé de la donnée</label>
        <input
          class="fr-input"
          type="text"
          id="label"
          v-model="datasetProperties.label"
        />
      </div>
      <div>
        <Tooltip
          title="Raison d'utilisation dans ce bouquet"
          name="tooltip__objectif"
          text="Ajoutez ici l'ensemble des informations nécessaires à la compréhension, l'objectif et l'utilisation du bouquet. N'hésitez pas à indiquer la réglementation ou une documentation liée au bouquet."
        />
        <Tooltip
          title="Utilisez du markdown pour mettre en forme votre texte"
          name="tooltip__markdown"
          text="* simple astérisque pour italique *<br/> ** double astérisque pour gras **<br/> # un dièse pour titre 1<br/> ## deux dièses pour titre 2<br/> *  astérisque pour une liste<br/> lien : [[https://exemple.fr]]"
        />
        <textarea
          class="fr-input"
          type="text"
          id="purpose"
          v-model="datasetProperties.purpose"
        />
      </div>
      <DsfrButton type="submit" label="Ajouter la donnée" :secondary="true" />
    </form>
  </div>
</template>

<script lang="ts">
import Tooltip from '@/components/Tooltip.vue'
import type { DatasetProperties } from '@/model'

interface DatasetPropertiesFormData {
  datasetProperties: DatasetProperties
}

export default {
  name: 'DatasetPropertiesForm',
  components: {
    Tooltip: Tooltip
  },
  data(): DatasetPropertiesFormData {
    return {
      datasetProperties: {
        label: '',
        purpose: ''
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('addDataset', {
        label: this.datasetProperties.label,
        purpose: this.datasetProperties.purpose
      })
      this.datasetProperties = {
        label: '',
        purpose: ''
      }
    }
  }
}
</script>

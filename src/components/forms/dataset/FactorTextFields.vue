<script setup lang="ts">
import type { ResolvedFactor } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'

const factor = defineModel('factor-model', {
  type: Object as () => ResolvedFactor,
  default: {}
})

defineProps({
  errorTitle: {
    type: String,
    default: ''
  },
  errorPurpose: {
    type: String,
    default: ''
  }
})

const { pageConf } = useCurrentPageConf()
</script>

<template>
  <div class="fr-input-group">
    <label class="fr-label" for="input-title">Libellé (obligatoire)</label>
    <p id="title-description" class="fr-mt-1v fr-mb-2v fr-text--sm">
      Indiquez la ou les informations clés pour le bouquet (indicateur,
      phénomène ou ou objet géographique), en termes génériques.
    </p>
    <input
      id="input-title"
      v-model="factor.title"
      class="fr-input"
      type="text"
      aria-describedby="title-description"
      aria-errormessage="errors-title"
      :aria-invalid="!!errorTitle"
    />
    <ErrorMessage
      v-if="errorTitle"
      input-name="title"
      :error-message="errorTitle"
    />
  </div>
  <div class="fr-input-group">
    <label class="fr-label" for="input-purpose"
      >Raison d'utilisation dans ce
      {{ pageConf.labels.singular }} (obligatoire)</label
    >
    <p id="purpose-description" class="fr-mt-1v fr-mb-2v fr-text--sm">
      Renseignez les motifs métier ou techniques motivant la sélection de ce jeu
      de données dans le bouquet. Cet espace vous permet également de signaler
      des éléments d'usage (limites, préconisations).<br />
      Utilisez du
      <a target="_blank" href="https://www.markdownguide.org/cheat-sheet/"
        ><span lang="en">markdown</span> (guide en anglais)</a
      >
      pour mettre en forme votre texte.
    </p>
    <textarea
      id="input-purpose"
      v-model="factor.description"
      class="fr-input"
      type="text"
      aria-describedby="purpose-description"
      aria-errormessage="errors-purpose"
      :aria-invalid="!!errorPurpose"
    />
    <ErrorMessage
      v-if="errorPurpose"
      input-name="purpose"
      :error-message="errorPurpose"
    />
  </div>
</template>

<style scoped>
textarea {
  min-height: 150px;
}
</style>

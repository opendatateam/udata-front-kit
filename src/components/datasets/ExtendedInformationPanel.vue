<script setup lang="ts">
import type { ExtendedDatasetV2 } from '@/model/dataset'
import ExtendedInformationPanelItem from './ExtendedInformationPanelItem.vue'

const props = defineProps({
  dataset: {
    type: Object as () => ExtendedDatasetV2,
    required: true
  }
})

const contactPoint = props.dataset.contact_point
const dcatExtras = props.dataset.extras?.dcat
const uri = props.dataset.harvest?.uri

const hasExtendedInfo = !!contactPoint || !!dcatExtras || !!uri
</script>

<template>
  <div
    v-if="hasExtendedInfo"
    class="fr-pb-3w border-bottom border-default-grey"
  >
    <div class="metadata-list fr-text--sm fr-m-0">
      <ExtendedInformationPanelItem
        v-if="uri"
        :items="[uri]"
        title="Identifiant de ressource unique"
      />
      <ExtendedInformationPanelItem
        :items="dcatExtras.accessRights"
        title="Conditions d'accès et d'utilisation"
      />
      <ExtendedInformationPanelItem
        :items="dcatExtras.provenance"
        title="Généalogie"
      />
      <div v-if="contactPoint">
        <h3 class="subtitle fr-mb-2v">Point de contact</h3>
        <p class="fr-text--sm fr-m-0">
          <a :href="`mailto:${contactPoint.email}`">{{ contactPoint.name }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metadata-list > :last-child {
  margin-bottom: 0 !important;
}
</style>

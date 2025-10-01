<script setup lang="ts">
import type { ExtendedDatasetV2 } from '@/model/dataset'
import { useFormatDate } from '@datagouv/components-next'
import ExtendedInformationPanelItem from './ExtendedInformationPanelItem.vue'

const props = defineProps({
  dataset: {
    type: Object as () => ExtendedDatasetV2,
    required: true
  }
})

const { formatDate } = useFormatDate()

const dcatExtras = props.dataset.extras?.dcat
const uri: string | undefined = props.dataset.harvest?.uri
const harvestCreatedAt = props.dataset.harvest?.created_at
const harvestModifiedAt = props.dataset.harvest?.modified_at
</script>

<template>
  <div
    v-if="dataset.harvest"
    class="fr-pb-3w border-bottom border-default-grey"
  >
    <h2 class="fr-sr-only">Informations étendues</h2>
    <div class="metadata-list fr-text--sm fr-m-0">
      <ExtendedInformationPanelItem
        v-if="uri"
        :items="[uri]"
        title="Identifiant de ressource unique"
      />
      <div class="fr-grid-row">
        <ExtendedInformationPanelItem
          v-if="harvestCreatedAt"
          class="fr-col-12 fr-col-md-6"
          :items="[formatDate(harvestCreatedAt)]"
          title="Publication"
        />
        <ExtendedInformationPanelItem
          v-if="harvestModifiedAt"
          :items="[formatDate(harvestModifiedAt)]"
          class="fr-col-12 fr-col-md-6"
          title="Dernière révision"
        />
      </div>
      <ExtendedInformationPanelItem
        :items="dcatExtras?.accessRights"
        title="Conditions d'accès et d'utilisation"
      />
      <ExtendedInformationPanelItem
        :items="dcatExtras?.provenance"
        title="Généalogie"
      />
    </div>
  </div>
</template>

<style scoped>
.metadata-list > :last-child {
  margin-bottom: 0 !important;
}
</style>

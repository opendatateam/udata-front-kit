<script setup lang="ts">
import type { ExtendedDatasetV2 } from '@/model/dataset'

const props = defineProps({
  dataset: {
    type: Object as () => ExtendedDatasetV2,
    required: true
  }
})

const contactPoint = props.dataset.contact_point
const accessRights = props.dataset.extras?.harvest?.['dct:accessRights']
const provenance = (
  props.dataset.extras?.harvest?.['dct:provenance'] || []
).filter((p: string) => !!p)

const hasExtendedInfo =
  !!accessRights || !!contactPoint || provenance.length > 0
</script>

<template>
  <div
    v-if="hasExtendedInfo"
    class="fr-py-3w fr-mb-3w border-bottom border-default-grey"
  >
    <h2 class="subtitle subtitle--uppercase">Informations étendues</h2>
    <div class="fr-text--sm fr-m-0">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div v-if="accessRights" class="fr-col-12 fr-col-sm-6 fr-col-md-4">
          <h3 class="subtitle fr-mb-1v">Conditions d'accès et d'utilisation</h3>
          <p class="fr-text--sm fr-m-0 text-mention-grey">
            {{ accessRights }}
          </p>
        </div>
        <div v-if="contactPoint" class="fr-col-12 fr-col-sm-6 fr-col-md-4">
          <h3 class="subtitle fr-mb-1v">Point de contact</h3>
          <p class="fr-text--sm fr-m-0 text-mention-grey">
            <a :href="`mailto:${contactPoint.email}`">{{
              contactPoint.name
            }}</a>
          </p>
        </div>
        <div v-if="provenance.length" class="fr-col-12 fr-col-sm-6 fr-col-md-4">
          <h3 class="subtitle fr-mb-1v">Généalogie</h3>
          <ul class="fr-text--sm fr-m-0 text-mention-grey">
            <li v-for="p in provenance" :key="p">{{ p }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

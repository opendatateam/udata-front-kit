<script setup lang="ts">
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import ContactPoints from '@/components/datasets/ContactPoints.vue'
import config from '@/config'
import { formatDate } from '@/utils'
import { useDatasetsConf } from '@/utils/config'
import { useLicense } from '@/utils/dataset'
import type { DatasetV2 } from '@datagouv/components-next'
import {
  AppLink,
  DatasetQuality,
  OrganizationNameWithCertificate
} from '@datagouv/components-next'
import { toRef } from 'vue'

const props = defineProps({
  dataset: {
    type: Object as PropType<DatasetV2>,
    required: true
  }
})

const datasetsConf = useDatasetsConf()

const license = useLicense(toRef(props.dataset))

const showHarvestQualityWarning = computed(() => {
  const backend = props.dataset.harvest?.backend
  const warningBackends = datasetsConf.harvest_backends_quality_warning || []
  return backend && warningBackends.includes(backend)
})
</script>

<template>
  <div class="fr-col-12 fr-col-md-4">
    <h2 id="producer" class="subtitle fr-mb-1v">
      <span v-if="dataset.contact_points.length">Éditeur</span>
      <span v-else>Producteur</span>
    </h2>
    <div v-if="dataset.organization" class="fr-grid-row fr-grid-row--middle">
      <OrganizationLogo :object="dataset" :size="32" class="fr-mr-1-5v" />
      <p class="fr-col fr-m-0 min-width-0">
        <a class="fr-link" :href="dataset.organization.page">
          <OrganizationNameWithCertificate
            :organization="dataset.organization"
          />
        </a>
      </p>
    </div>
    <template v-if="dataset.contact_points.length">
      <h2 id="attributions" class="subtitle fr-mb-1v fr-mt-3v">Attributions</h2>
      <ContactPoints :contact-points="dataset.contact_points" />
    </template>
    <div v-if="dataset.harvest?.remote_url" class="fr-my-3v fr-text--sm">
      <div class="bg-alt-blue-cumulus fr-p-3v fr-mb-1w">
        <p class="fr-grid-row fr-grid-row--middle fr-my-0">
          Ce jeu de données provient d'un portail externe.
          <AppLink
            :to="dataset.harvest.remote_url"
            target="_blank"
            rel="noopener nofollow"
            >Voir la source originale.</AppLink
          >
        </p>
      </div>
    </div>
    <template v-if="dataset.harvest">
      <template v-if="dataset.harvest.modified_at">
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière révision</h2>
        <p>
          {{ formatDate(dataset.harvest.modified_at) }}
        </p>
      </template>
    </template>
    <template v-else>
      <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
      <p>{{ formatDate(dataset.last_update) }}</p>
    </template>
    <template v-if="license">
      <h2 class="subtitle fr-mt-3v fr-mb-1v">Licence</h2>
      <p class="fr-text--sm fr-mt-0 fr-mb-3v">
        <code class="bg-alt-grey fr-px-1v text-grey-380">
          <a :href="license.url">
            {{ license.title }}
          </a>
        </code>
      </p>
    </template>
    <DatasetQuality
      v-if="config.website.show_quality_component"
      :quality="dataset.quality"
    />
    <div
      v-if="showHarvestQualityWarning"
      class="text-mention-grey fr-text--sm fr-my-1v"
    >
      <VIconCustom name="warning-line" class="fr-icon--sm" />
      La qualité des métadonnées peut être trompeuse car les métadonnées de la
      source originale peuvent avoir été perdues lors de leur récupération. Nous
      travaillons actuellement à améliorer la situation.
    </div>
    <slot name="bottom" />
  </div>
</template>

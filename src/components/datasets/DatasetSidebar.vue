<script setup lang="ts">
import ContactPoints from '@/components/datasets/ContactPoints.vue'
import MetricsStatBoxes from '@/components/MetricsStatBoxes.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import SidebarItem from '@/components/SidebarItem.vue'
import SidebarList from '@/components/SidebarList.vue'
import VIconCustom from '@/components/VIconCustom.vue'
import config from '@/config'
import type { TypedHarvest } from '@/model/dataset'
import { formatDate } from '@/utils'
import { useDatasetsConf } from '@/utils/config'
import { useBadges } from '@/utils/dataset'
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import {
  AppLink,
  DatasetQuality,
  LabelTag,
  OrganizationNameWithCertificate
} from '@datagouv/components-next'
import { toRef } from 'vue'

const props = defineProps({
  dataset: {
    type: Object as PropType<DatasetV2WithFullObject>,
    required: true
  }
})

const datasetsConf = useDatasetsConf()

const harvest = computed(() => props.dataset.harvest as TypedHarvest)
const datasetRef = toRef(props.dataset)
const badges = useBadges(datasetRef)

const showHarvestQualityWarning = computed(() => {
  const backend = harvest.value?.backend
  const warningBackends = datasetsConf.harvest_backends_quality_warning || []
  return backend && warningBackends.includes(backend)
})
</script>

<template>
  <div class="dataset-sidebar fr-col-12 fr-col-md-4">
    <SidebarList>
      <SidebarItem
        id="producer"
        :term="dataset.contact_points.length ? 'Éditeur' : 'Producteur'"
      >
        <div
          v-if="dataset.organization"
          class="fr-grid-row fr-grid-row--middle"
        >
          <OrganizationLogo :object="dataset" :size="32" class="fr-mr-1-5v" />
          <p class="fr-col fr-m-0 min-width-0">
            <a class="fr-link" :href="dataset.organization.page">
              <OrganizationNameWithCertificate
                :organization="dataset.organization"
              />
            </a>
          </p>
        </div>
      </SidebarItem>
      <SidebarItem
        v-if="dataset.contact_points.length"
        id="attributions"
        class="fr-mt-3v"
        term="Attributions"
      >
        <ContactPoints :contact-points="dataset.contact_points" />
      </SidebarItem>
    </SidebarList>
    <div v-if="harvest?.remote_url" class="fr-my-3v fr-text--sm">
      <div class="bg-alt-blue fr-p-3v fr-mb-1w">
        <p class="fr-grid-row fr-grid-row--middle fr-my-0">
          Ce jeu de données provient d'un portail externe.
          <AppLink
            :to="harvest.remote_url"
            target="_blank"
            rel="noopener nofollow"
            >Voir la source originale.</AppLink
          >
        </p>
      </div>
    </div>
    <SidebarList class="fr-mt-3v">
      <template v-if="harvest">
        <SidebarItem v-if="harvest.modified_at" term="Dernière révision">
          {{ formatDate(harvest.modified_at) }}
        </SidebarItem>
      </template>
      <SidebarItem v-else term="Dernière mise à jour">
        {{ formatDate(dataset.last_update) }}
      </SidebarItem>
      <SidebarItem v-if="dataset.license?.url" class="fr-mt-3v" term="Licence">
        <p class="fr-text--sm fr-mt-0 fr-mb-3v">
          <code class="license-code fr-px-1v text-grey-425">
            <a :href="dataset.license.url">
              {{ dataset.license.title }}
            </a>
          </code>
        </p>
      </SidebarItem>
    </SidebarList>
    <MetricsStatBoxes object-type="dataset" :object-id="dataset.id" />
    <div v-if="config.website.show_quality_component" class="fr-mt-3v">
      <DatasetQuality :quality="dataset.quality" />
    </div>
    <div
      v-if="showHarvestQualityWarning"
      class="text-mention-grey fr-text--sm fr-my-1v"
    >
      <VIconCustom name="warning-line" class="fr-icon--sm" />
      La qualité des métadonnées peut être trompeuse car les métadonnées de la
      source originale peuvent avoir été perdues lors de leur récupération. Nous
      travaillons actuellement à améliorer la situation.
    </div>
    <SidebarList v-if="badges.length > 0" class="fr-mt-3v">
      <SidebarItem id="labels" term="Label">
        <LabelTag
          v-for="badge in badges"
          :key="badge.kind"
          :badge
          class="fr-mr-1v"
        />
      </SidebarItem>
    </SidebarList>
    <slot name="bottom" />
  </div>
</template>

<style scoped>
.license-code {
  background-color: var(--background-alt-grey);
}
</style>

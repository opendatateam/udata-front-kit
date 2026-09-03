<script setup lang="ts">
import ContactPoints from '@/components/datasets/ContactPoints.vue'
import MetricsStatBoxes from '@/components/MetricsStatBoxes.vue'
import SidebarItem from '@/components/SidebarItem.vue'
import SidebarList from '@/components/SidebarList.vue'
import SidebarOwner from '@/components/SidebarOwner.vue'
import VIconDsfr from '@/components/VIconDsfr.vue'
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
  Toggletip
} from '@datagouv/components-next'
import { toRef } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  dataset: {
    type: Object as PropType<DatasetV2WithFullObject>,
    required: true
  }
})

const datasetsConf = useDatasetsConf()
const router = useRouter()

const harvest = computed(() => props.dataset.harvest as TypedHarvest)
const datasetRef = toRef(props.dataset)
const badges = useBadges(datasetRef)

// Labels are a data.gouv.fr-wide concept: always link to the main datasets search.
const badgeUrl = (kind: string) =>
  router.hasRoute('datasets')
    ? { name: 'datasets', query: { badge: kind } }
    : undefined

const showHarvestQualityWarning = computed(() => {
  const backend = harvest.value?.backend
  const warningBackends = datasetsConf.harvest_backends_quality_warning || []
  return backend && warningBackends.includes(backend)
})

const hasContactPointsWithSpecificRole = computed(() => {
  if (!props.dataset) return false
  return props.dataset.contact_points.some(
    (contactPoint) => contactPoint.role !== 'contact'
  )
})
</script>

<template>
  <div class="dataset-sidebar fr-col-12 fr-col-md-4">
    <SidebarList>
      <SidebarItem
        id="producer"
        :term="hasContactPointsWithSpecificRole ? 'Diffuseur' : 'Producteur'"
      >
        <SidebarOwner :object="dataset" />
      </SidebarItem>
      <SidebarItem
        v-if="dataset.contact_points.length"
        id="attributions"
        :term="hasContactPointsWithSpecificRole ? 'Attributions' : 'Contacts'"
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
      <SidebarItem v-if="harvest?.modified_at" term="Dernière révision">
        {{ formatDate(harvest.modified_at) }}
      </SidebarItem>
      <SidebarItem v-else term="Dernière mise à jour">
        {{ formatDate(dataset.last_update) }}
      </SidebarItem>
      <SidebarItem v-if="dataset.license?.url" term="Licence">
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
      <VIconDsfr name="warning-line" class="fr-icon--sm" />
      La qualité des métadonnées peut être trompeuse car les métadonnées de la
      source originale peuvent avoir été perdues lors de leur récupération. Nous
      travaillons actuellement à améliorer la situation.
    </div>
    <SidebarList v-if="badges.length > 0" class="fr-mt-3v">
      <SidebarItem id="labels" term="Label">
        <template #term-prefix>
          <Toggletip
            button-class="toggletip-label-button"
            :button-props="{
              title: 'En savoir plus sur les labels de données'
            }"
            no-margin
          >
            <template #toggletip="{ close }">
              <div class="toggletip-header justify-between border-bottom">
                <h5 class="fr-text--sm fr-my-0 fr-p-2v">Label</h5>
                <button
                  type="button"
                  title="Fermer"
                  class="toggletip-close border-left"
                  @click="close"
                >
                  &times;
                </button>
              </div>
              <div class="fr-p-2v">
                Certains jeux de données bénéficient d'un ou plusieurs labels
                reconnus au niveau national, européen ou international.
                <br />
                Ces labels peuvent signaler une valeur réglementaire ou une
                importance stratégique.
              </div>
            </template>
          </Toggletip>
        </template>
        <LabelTag
          v-for="badge in badges"
          :key="badge.kind"
          :badge
          :url="badgeUrl(badge.kind)"
          class="fr-mr-1v fr-mb-1v"
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

.toggletip-header {
  display: flex;
}

.toggletip-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  font-size: 1.2rem;
}
</style>

<style>
/* headlessui's Popover isn't an SFC, so it breaks Vue's scoped data-v chain: this can't be `scoped` */
.toggletip-label-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin-left: -0.25rem;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: inherit;
  transform: translateY(1px);
}

.toggletip-label-button:hover {
  background-color: var(--background-alt-grey);
}
</style>

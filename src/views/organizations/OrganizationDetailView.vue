<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { useHead } from '@unhead/vue'
import { computed, inject, onMounted, ref, watchEffect, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'

import GenericContainer from '@/components/GenericContainer.vue'
import Tile from '@/components/Tile.vue'
import config from '@/config'
import { useRouteParamsAsString } from '@/router/utils'
import { useDatasetStore } from '@/store/DatasetStore'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { descriptionFromMarkdown } from '@/utils'

const route = useRouteParamsAsString()
const organizationId = route.params.oid

const orgStore = useOrganizationStore()
const datasetStore = useDatasetStore()

const org = computed(() => orgStore.get(organizationId))

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { to: '/organizations', text: 'Organisations' },
  { text: org.value?.name }
])

const currentPage = ref(1)
const pages: Ref<object[]> = ref([])
const datasets: Ref<DatasetV2[] | undefined> = ref(undefined)
const selectedSort = ref('-created')

const setAccessibilityProperties = inject(
  'setAccessibilityProperties'
) as Function

const metaTitle = (): string => {
  return `${org.value?.name} | ${config.website.title}`
}

useHead({
  title: metaTitle
})

onMounted(() => {
  orgStore
    .load(organizationId, -1, { toasted: false, redirectNotFound: true })
    .then(() => {
      setAccessibilityProperties(org.value?.name)
    })
})

const sorts = [
  { value: '-created', text: 'Les plus récemment créés' },
  { value: 'title', text: 'Titre' }
]

function doSort(sort: string) {
  currentPage.value = 1
  selectedSort.value = sort
}

const description = computed(() => descriptionFromMarkdown(org))

// we need the technical id to fetch the datasets and thus pagination
watchEffect(() => {
  if (org.value?.id === undefined) return
  const loader = useLoading().show({
    enforceFocus: false
  })
  datasetStore
    .loadDatasetsForOrg(org.value.id, currentPage.value, selectedSort.value)
    .then((res) => {
      datasets.value = res?.data
      if (!pages.value.length && org.value?.id) {
        pages.value = datasetStore.getDatasetsPaginationForOrg(org.value?.id)
      }
    })
    .finally(() => {
      loader.hide()
    })
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer>
    <h1 class="fr-mb-2v">{{ org?.name }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="description"></div>

    <div class="w-100 fr-grid-row fr-grid-row--middle fr-mt-5v justify-end">
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <label
          for="sort-search"
          class="fr-col-auto fr-text--sm fr-m-0 fr-mr-1w"
        >
          Trier par :
        </label>
        <div class="fr-col">
          <DsfrSelect
            :model-value="selectedSort"
            :options="sorts"
            label=""
            @update:model-value="doSort"
          ></DsfrSelect>
        </div>
      </div>
    </div>

    <h2 class="fr-mt-2w">Jeux de données</h2>
    <div v-if="!datasets?.length">
      Pas de jeu de données pour cette organisation.
    </div>
    <ul v-else class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li v-for="d in datasets" :key="d.id" class="fr-col-12 fr-col-lg-4">
        <Tile
          :link="`/datasets/${d.slug}`"
          :title="d.title"
          :description="d.description"
          :img="d.organization?.logo"
        />
      </li>
    </ul>
  </GenericContainer>
  <DsfrPagination
    v-if="pages.length"
    class="fr-container"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="(p: number) => (currentPage = p + 1)"
  />
</template>

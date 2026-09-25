<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'

import GenericContainer from '@/components/GenericContainer.vue'
import NetworkCard from '@/components/NetworkCard.vue'
import OrganizationCard from '@/components/OrganizationCard.vue'
import config from '@/config'
import type { OrganizationsConfig } from '@/model/config'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { useNetworksConf } from '@/utils/config'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

const store = useOrganizationStore()
const $loading = useLoading()

const currentPage = ref(1)
const { pagination } = storeToRefs(store)
const organizations: Ref<Organization[]> = ref([])

const networks = useNetworksConf()
const hasNetworks = Object.keys(networks).length > 0
// bump card headings one level when the "Réseaux"/"Organisations" subheadings are shown
const cardHeadingLevel = hasNetworks ? 'h3' : 'h2'

const organizationsConfig = config.organizations as OrganizationsConfig
const title = organizationsConfig.page?.breadcrumb_title || 'Organisations'
const links = computed(() => [{ to: '/', text: 'Accueil' }, { text: title }])

async function onUpdatePage(page: number) {
  const loader = $loading.show()
  currentPage.value = page + 1
  // using 'datasets' as pageKey to map correct organizations config from file
  organizations.value = await store.loadFromConfig(
    'datasets',
    currentPage.value
  )
  loader.hide()
}

useMeta({
  title: () => organizationsConfig.page?.meta?.title ?? 'Organisations',
  description: () => organizationsConfig.page?.meta?.description,
  canonicalUrl: useCanonicalUrl()
})

onMounted(() => {
  onUpdatePage(0)
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer>
    <h1 class="fr-mb-5v">{{ title }}</h1>

    <template v-if="hasNetworks">
      <h2 class="fr-mb-3v">Réseaux</h2>
      <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-mb-8v">
        <li
          v-for="(network, slug) in networks"
          :key="slug"
          class="fr-col-12 fr-col-lg-4"
        >
          <NetworkCard
            :slug="String(slug)"
            :network="network"
            :heading-level="cardHeadingLevel"
          />
        </li>
      </ul>

      <h2 class="fr-mb-3v">Organisations</h2>
    </template>

    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li
        v-for="org in organizations"
        :key="org.id"
        class="fr-col-12 fr-col-lg-4"
      >
        <OrganizationCard
          :organization="org"
          :heading-level="cardHeadingLevel"
        />
      </li>
    </ul>
  </GenericContainer>
  <DsfrPagination
    v-if="pagination.length"
    :trunc-limit="3"
    class="fr-container"
    :current-page="currentPage - 1"
    :pages="pagination"
    @update:current-page="onUpdatePage"
  />
</template>

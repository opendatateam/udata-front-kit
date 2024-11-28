<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'

import GenericContainer from '@/components/GenericContainer.vue'
import config from '@/config'
import { useOrganizationStore } from '@/store/OrganizationStore'
import type { Organization } from '@datagouv/components'

const store = useOrganizationStore()
const $loading = useLoading()

const currentPage = ref(1)
const pages = store.getPagination()
const organizations: Ref<Organization[]> = ref([])

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: 'Organisations' }
])

const title = config.website.title

async function onUpdatePage(page: number) {
  const loader = $loading.show()
  currentPage.value = page + 1
  organizations.value = await store.loadFromConfig(currentPage.value)
  loader.hide()
}

const isCertified = (org: object): boolean =>
  org.badges.some((badge) => badge.kind === 'certified')

const isPublicService = (org: object): boolean =>
  org.badges.some((badge) => badge.kind === 'public-service')

onMounted(() => {
  onUpdatePage(0)
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer>
    <h1 class="fr-mb-2v">Organisations</h1>
    <p>Parcourir toutes les organisations présentes sur {{ title }}.</p>
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li
        v-for="org in organizations"
        :key="org.id"
        class="fr-col-12 fr-col-lg-4"
      >
        <OrganizationCard
          :link="`/organizations/${org.slug}`"
          :title="org.name"
          :description="org.description"
          :img="org.logo"
          :is-markdown="true"
          :tags="[`<strong>${org.metrics.datasets}</strong> jeux de données`]"
          :is-certified="isCertified(org)"
          :is-public-service="isPublicService(org)"
        />
      </li>
    </ul>
  </GenericContainer>
  <DsfrPagination
    v-if="pages.length"
    class="fr-container"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="onUpdatePage"
  />
</template>

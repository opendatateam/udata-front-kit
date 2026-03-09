<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'

import GenericContainer from '@/components/GenericContainer.vue'
import config from '@/config'
import { useOrganizationStore } from '@/store/OrganizationStore'

const store = useOrganizationStore()
const $loading = useLoading()

const currentPage = ref(1)
const { pagination } = storeToRefs(store)
const organizations: Ref<Organization[]> = ref([])

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: 'Organisations' }
])

const title: string = config.website.formatted_title

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
    <p>
      <!-- eslint-disable-next-line vue/no-v-html -->
      Parcourir toutes les organisations présentes sur <span v-html="title" />.
    </p>
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li
        v-for="org in organizations"
        :key="org.id"
        class="fr-col-12 fr-col-lg-4"
      >
        <OrganizationCard :organization="org" heading-level="h2" />
      </li>
    </ul>
  </GenericContainer>
  <DsfrPagination
    v-if="pagination.length"
    class="fr-container"
    :current-page="currentPage - 1"
    :pages="pagination"
    @update:current-page="onUpdatePage"
  />
</template>

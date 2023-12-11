<script setup>
import { computed, ref, onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'

import config from '@/config'

import Tile from '../../components/Tile.vue'
import { useOrganizationStore } from '../../store/OrganizationStore'

const store = useOrganizationStore()
const $loading = useLoading()

const currentPage = ref(1)
const pages = store.getPagination()
const organizations = ref([])

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: 'Organisations' }
])

const title = config.website.title

async function onUpdatePage(page) {
  const loader = $loading.show()
  currentPage.value = page + 1
  organizations.value = await store.loadFromConfig(currentPage.value)
  loader.hide()
}

onMounted(() => {
  onUpdatePage(0)
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
  </div>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <h1>Organisations</h1>
    <p>Parcourir toutes les organisations présentes sur {{ title }}.</p>
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li v-for="org in organizations" class="fr-col-12 fr-col-lg-4">
        <Tile
          :link="`/organizations/${org.slug}`"
          :title="org.name"
          :description="org.description"
          :img="org.logo"
          :is-markdown="true"
        />
      </li>
    </ul>
  </div>
  <DsfrPagination
    class="fr-container"
    v-if="pages.length"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="onUpdatePage"
  />
</template>

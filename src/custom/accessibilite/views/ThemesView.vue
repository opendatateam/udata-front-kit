<script lang="ts" setup>
import VIconCustom from '@/components/VIconCustom.vue'
import { useUserStore } from '@/store/UserStore'
import { usePageConf } from '@/utils/config'
import { useLabels } from '@/utils/labels'
import CustomSearch from '../components/home/CustomSearch.vue'
import ThemesList from '../components/ThemesList.vue'

const userStore = useUserStore()
const route = useRoute()
const pageKey = computed(() => route.meta.pageKey as string)
const pageConf = computed(() => usePageConf(pageKey.value))
const labels = computed(() => useLabels(pageConf.value.labels))

const createUrl = computed(() => ({
  name: `${pageKey.value}_add`,
  query: route.query
}))

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { text: 'Données par thèmes' }
])

const router = useRouter()
const searchQuery = ref('')

const doSearch = (q: string) => {
  router
    .push({ name: 'datasets', query: { q } })
    .then(() => (searchQuery.value = ''))
}
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>

  <ThemesList
    class="fr-mt-2w"
    title="Données par thèmes"
    title-level="h1"
    :themes-display="20"
  >
    <template #title>
      <div class="fr-grid-row fr-grid-row--middle justify-between fr-mb-3w">
        <h1 class="fr-mb-0">{{ pageConf.title }}</h1>
        <div
          v-if="
            pageConf.object_type === 'topics' && userStore.canAddTopic(pageKey)
          "
          class="fr-col-auto fr-grid-row fr-grid-row--middle fr-grid-row--gutters"
        >
          <div class="fr-col-auto">
            <router-link :to="createUrl" class="fr-btn fr-mb-1w">
              <VIconCustom
                name="add-circle-line"
                class="fr-mr-1w"
                align="middle"
              />
              Ajouter {{ labels.articles.un }} {{ labels.singular }}
            </router-link>
          </div>
          <div class="fr-col-auto">
            <router-link
              :to="{ name: `${pageKey}_drafts` }"
              class="fr-btn fr-btn--secondary fr-mb-1w"
            >
              Mes brouillons
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </ThemesList>

  <section class="fr-container fr-mt-10w fr-mb-12w">
    <h2 class="h1">Vous cherchez des données en particulier&nbsp;?</h2>
    <CustomSearch @on-search="doSearch" />
  </section>
</template>

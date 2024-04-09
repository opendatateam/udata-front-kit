<script setup lang="ts">
import { ref, watch, computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BouquetList from '@/custom/ecospheres/components/BouquetList.vue'
import BouquetSearch from '@/custom/ecospheres/components/BouquetSearch.vue'
import { type BreadcrumbItem, NoOptionSelected } from '@/model'

const route = useRoute()
const router = useRouter()

const themeName = ref(NoOptionSelected)
const subthemeName = ref(NoOptionSelected)
const showDrafts = ref(false)
const geozone: Ref<string | null> = ref(null)

const subThemeQuery = computed(() => route.query.subtheme)
const themeQuery = computed(() => route.query.theme)
const geozoneQuery = computed(() => route.query.geozone)

watch(
  [subThemeQuery],
  (newVal) => {
    subthemeName.value = newVal[0]?.toString() ?? NoOptionSelected
  },
  { immediate: true }
)

watch(
  [themeQuery],
  (newVal) => {
    themeName.value = newVal[0]?.toString() ?? NoOptionSelected
  },
  { immediate: true }
)

watch(
  [geozoneQuery],
  (newVal) => {
    geozone.value = newVal[0]?.toString() ?? null
  },
  { immediate: true }
)

const breadcrumbList = computed(() => {
  const links: BreadcrumbItem[] = []
  links.push({ text: 'Accueil', to: '/' })
  links.push({ text: 'Bouquets', to: '/bouquets' })
  if (themeName.value !== NoOptionSelected && themeName.value !== '') {
    links.push({
      text: themeName.value,
      to: `/bouquets?theme=${themeName.value}&subtheme=${NoOptionSelected}`
    })
    if (subthemeName.value !== NoOptionSelected && subthemeName.value !== '') {
      links.push({ text: subthemeName.value })
    }
  }
  return links
})

const goToCreate = () => {
  router.push({ name: 'bouquet_add', query: route.query })
}
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbList" />
  </div>
  <div class="fr-container fr-mb-4w">
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
    >
      <h1 class="fr-col-auto fr-mb-2v">Bouquets</h1>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <DsfrButton
          secondary
          class="fr-mb-1w"
          label="Ajouter un bouquet"
          icon="ri-add-circle-line"
          @click="goToCreate"
        />
      </div>
    </div>
    <div class="fr-mt-2w">
      <div className="fr-grid-row">
        <nav
          className="fr-sidemenu fr-col-md-4"
          aria-labelledby="fr-sidemenu-title"
        >
          <div className="fr-sidemenu__inner">
            <div id="fr-sidemenu-title" className="fr-sidemenu__title">
              Filtres
            </div>
            <BouquetSearch
              v-model:themeName="themeName"
              v-model:subthemeName="subthemeName"
              v-model:geozone="geozone"
              @update:show-drafts="(value) => (showDrafts = value)"
            />
          </div>
        </nav>
        <div className="fr-col">
          <BouquetList
            :theme-name="themeName"
            :subtheme-name="subthemeName"
            :show-drafts="showDrafts"
            :geozone="geozone"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped="true" lang="scss">
@media (max-width: 768px) {
  .fr-sidemenu {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 2em;
    width: 100%;
    .fr-sidemenu__title {
      box-shadow: none;
    }
  }
}
</style>

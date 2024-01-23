<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

import BouquetList from '@/custom/ecospheres/components/BouquetList.vue'
import BouquetSearch from '@/custom/ecospheres/components/BouquetSearch.vue'
import { type BreadcrumbItem, NoOptionSelected } from '@/model'

const route = useRoute()

const themeName = ref(NoOptionSelected)
const subthemeName = ref(NoOptionSelected)

const subThemeQuery = computed(() => route.query.subtheme)
const themeQuery = computed(() => route.query.theme)

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
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbList" />
  </div>
  <div class="fr-container fr-mb-4w">
    <h1 class="fr-mb-2v">Bouquets</h1>
    <div class="fr-mt-2w">
      <div className="fr-grid-row topicListView">
        <nav
          className="fr-sidemenu fr-col-4"
          aria-labelledby="fr-sidemenu-title"
        >
          <div className="fr-sidemenu__inner">
            <div id="fr-sidemenu-title" className="fr-sidemenu__title">
              Filtres
            </div>
            <BouquetSearch
              v-model:themeName="themeName"
              v-model:subthemeName="subthemeName"
            />
          </div>
        </nav>
        <div className="fr-col-8">
          <BouquetList :theme-name="themeName" :subtheme-name="subthemeName" />
        </div>
      </div>
    </div>
  </div>
</template>

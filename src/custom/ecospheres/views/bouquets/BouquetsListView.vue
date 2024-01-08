<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

import BouquetList from '@/custom/ecospheres/components/BouquetList.vue'
import BouquetSearch from '@/custom/ecospheres/components/BouquetSearch.vue'
import { type BreadcrumbItem, NoOptionSelected } from '@/model'

const route = useRoute()

const props = defineProps({
  initThemeName: {
    type: String,
    default: NoOptionSelected
  },
  initSubthemeName: {
    type: String,
    default: NoOptionSelected
  }
})

const themeName = ref(props.initThemeName)
const subthemeName = ref(props.initSubthemeName)

const subThemeQuery = computed(() => route.query.subtheme)
const themeQuery = computed(() => route.query.theme)

watch([subThemeQuery], (newVal) => {
  subthemeName.value = newVal
})

watch([themeQuery], (newVal) => {
  themeName.value = newVal
})

const breadcrumbList = computed(() => {
  const links: BreadcrumbItem[] = []
  if (themeName.value !== NoOptionSelected) {
    links.push({ text: 'Accueil', to: '/' })
    links.push({
      text: themeName.value,
      to: `/bouquets?theme=${themeName.value}`
    })
    if (subthemeName.value !== NoOptionSelected) {
      links.push({ text: subthemeName.value })
    }
  }
  return links
})

const classDependingOnBreadcrumb = computed(() => {
  return breadcrumbList.value.length > 0
    ? 'with_breadcrumb'
    : 'without_breadcrumb'
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <DsfrBreadcrumb class="breadcrumb" :links="breadcrumbList" />
    <div :class="classDependingOnBreadcrumb">
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

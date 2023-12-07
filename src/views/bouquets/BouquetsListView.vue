<template>
  <div class="fr-container width-inherit fr-container--fluid fr-mt-4w fr-mb-4w">
    <DsfrBreadcrumb class="breadcrumb" :links="breadcrumbList" />
    <div :class="classDependingOnBreadcrumb">
      <div className="fr-grid-row topicListView">
        <nav
          className="fr-sidemenu fr-col-4"
          aria-labelledby="fr-sidemenu-title"
        >
          <div className="fr-sidemenu__inner">
            <div className="fr-sidemenu__title" id="fr-sidemenu-title">
              Filtres
            </div>
            <TopicSearch
              v-model:themeName="themeName"
              v-model:subthemeName="subthemeName"
            />
          </div>
        </nav>
        <div className="fr-col-8">
          <TopicList :themeName="themeName" :subthemeName="subthemeName" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TopicList from '../../components/TopicList.vue'
import TopicSearch from '../../components/TopicSearch.vue'
import type { BreadcrumbItem } from '../../model'
import { NoOptionSelected } from '../../model'

export default {
  name: 'BouquetsListView',
  components: {
    TopicSearch: TopicSearch,
    TopicList: TopicList
  },
  props: {
    initThemeName: {
      type: String,
      default: NoOptionSelected
    },
    initSubthemeName: {
      type: String,
      default: NoOptionSelected
    }
  },
  data() {
    return {
      themeName: this.initThemeName,
      subthemeName: this.initSubthemeName
    }
  },
  watch: {
    '$route.query.subtheme'(newVal) {
      this.subthemeName = newVal
    },
    '$route.query.theme'(newVal) {
      this.themeName = newVal
    }
  },
  computed: {
    breadcrumbList() {
      const links: BreadcrumbItem[] = []
      if (this.themeName !== NoOptionSelected) {
        links.push({ text: 'Accueil', to: '/' })
        links.push({
          text: this.themeName,
          to: `/bouquets?theme=${this.themeName}`
        })
        if (this.subthemeName !== NoOptionSelected) {
          links.push({ text: this.subthemeName })
        }
      }
      return links
    },
    classDependingOnBreadcrumb() {
      return this.breadcrumbList.length > 0
        ? 'with_breadcrumb'
        : 'without_breadcrumb'
    }
  }
}
</script>

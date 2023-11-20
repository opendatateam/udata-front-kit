<template>
  <div className="fr-grid-row topicListView">
    <nav className="fr-sidemenu fr-col-4" aria-labelledby="fr-sidemenu-title">
      <div className="fr-sidemenu__inner">
        <div className="fr-sidemenu__title" id="fr-sidemenu-title">Filtres</div>
        <TopicSearch
          v-model:themeName="themeName"
          v-model:subthemeName="subthemeName"
        />
      </div>
    </nav>
    <div className="fr-col-8">
      <DsfrBreadcrumb
        class="home-selection-breadcrumb"
        :links="breadcrumbList"
      />
      <TopicList :themeName="themeName" :subthemeName="subthemeName" />
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
  computed: {
    breadcrumbList() {
      const links: BreadcrumbItem[] = []
      if (this.themeName !== NoOptionSelected) {
        links.push({ text: 'Accueil', to: '/' })
        links.push({ text: this.themeName, to: `/?theme=${this.themeName}` })
        if (this.subthemeName !== NoOptionSelected) {
          links.push({ text: this.subthemeName })
        }
      }
      return links
    }
  }
}
</script>

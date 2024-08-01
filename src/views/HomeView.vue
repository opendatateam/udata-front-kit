<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'

import SubSectionButtons from '../components/sections/SubSectionButtons.vue'
import SubSectionCards from '../components/sections/SubSectionCards.vue'
import SubSectionDatasets from '../components/sections/SubSectionDatasets.vue'
import SubSectionTiles from '../components/sections/SubSectionTiles.vue'
import { fromMarkdown } from '../utils'

const router = useRouter()
const query = ref('')

// TODO: mutualize w/ App.vue
const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  router.push({ name: 'datasets', query: { q: query.value } })
}

const homepageTitle = config.website.homepage.title
const homepageSubTitle = config.website.homepage.subtitle
const sectionsHomePage = config.website.homepage.sections
const colorsBanner = config.website.home_banner_colors
const searchConfig = config.website.search_bar
const secondarySearchConfig = config.website.secondary_search

const goToPage = (page) => {
  window.location.href = page
}
</script>

<template>
  <div
    class="banner"
    :style="
      'background: linear-gradient(0.25turn, ' +
      colorsBanner[0] +
      ', ' +
      colorsBanner[1] +
      ', ' +
      colorsBanner[2] +
      ');'
    "
  >
    <div class="fr-container">
      <h1 class="main-title fr-mb-3v">
        {{ homepageTitle }}
      </h1>
      <div class="fr-mt-5w">
        <div class="subtitle fr-text--alt fr-mb-10w">
          <span v-html="fromMarkdown(homepageSubTitle)" />
        </div>
      </div>
      <div v-if="searchConfig.display" class="search-bar">
        <DsfrSearchBar
          button-text="Rechercher"
          class="search-bar-input"
          :style="
            secondarySearchConfig.display
              ? 'min-width: 80%;'
              : 'min-width: 100%;'
          "
          :placeholder="searchConfig.placeholder"
          :large="false"
          @search="doSearch"
          @update:model-value="updateQuery"
        />
        <div v-if="secondarySearchConfig.display" class="or-sep">ou</div>
        <div
          v-if="secondarySearchConfig.display"
          class="button-search-guided"
          @click="goToPage(secondarySearchConfig.link)"
        >
          {{ secondarySearchConfig.name }}
        </div>
      </div>
    </div>
  </div>
  <div v-for="item in sectionsHomePage" v-bind:key="item">
    <div class="fr-container hero-text">
      <h4 v-if="item.title">{{ item.title }}</h4>
      <span v-html="fromMarkdown(item.content)"></span>
      <div class="fr-mt-4w fr-col-md-12 datagouv-components">
        <SubSectionDatasets
          v-if="item.sub_section_datasets"
          :subsection="item.sub_section_datasets"
        />
        <SubSectionCards
          v-if="item.sub_section_cards"
          :subsection="item.sub_section_cards"
        />
        <SubSectionTiles
          v-if="item.sub_section_tiles"
          :subsection="item.sub_section_tiles"
        />
        <SubSectionButtons
          v-if="item.sub_section_buttons"
          :subsection="item.sub_section_buttons"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@media (min-width: 1248px) {
  .search-bar {
    display: flex;
    position: absolute;
    bottom: 0;
    max-width: 78rem;
    width: 90%;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .or-sep {
    max-width: 30px;
    margin-left: 20px;
    margin-right: 20px;
  }
}
@media (max-width: 1248px) {
  .or-sep {
    width: 100%;
    margin-top: 10px;
  }
  .button-search-guided {
    margin-top: 10px;
  }
  .search-bar {
    margin-left: 30px;
    margin-right: 30px;
    border-radius: 10px;
  }
}

.fr-container {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.banner {
  padding-top: 5%;
  padding-bottom: 5%;
  position: relative;
}
.main-title {
  text-align: left;
  font-size: 48px;
  line-height: 50px;
  font-weight: 800;
}
.subtitle {
  text-align: left;
  font-style: italic;
  font-size: 20px;
  line-height: 28px;
}
.hero-text {
  margin-top: 30px;
  text-align: left;
}
.search-bar {
  padding: 20px;
  background-color: white;
}
.search-bar-input {
  flex-wrap: nowrap;
  height: 40px;
}
.button-search-guided {
  background-color: #3557a2;
  padding-left: 10px;
  padding-right: 10px;
  color: white;
  font-weight: bold;
  vertical-align: middle;
  line-height: 40px;
  height: 40px;
  border-radius: 20px;
}
.button-search-guided:hover {
  cursor: pointer;
  background-color: #5982e0;
}
.or-sep {
  text-align: 'center';
  line-height: 40px;
}
</style>

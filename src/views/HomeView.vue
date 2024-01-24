<script setup>
import MarkdownIt from 'markdown-it'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'

import HomeButtons from '../components/HomeButtons.vue'
import HomeCharts from '../components/HomeCharts.vue'
import HomeThemes from '../components/HomeThemes.vue'
import HomeTopics from '../components/HomeTopics.vue'

const router = useRouter()
const query = ref('')
const markdown = new MarkdownIt()

// TODO: mutualize w/ App.vue
const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  router.push({ name: 'datasets', query: { q: query.value } })
}

const homepageTitle = config.website.homepage.title
const homepageSubTitle = config.website.homepage.subtitle
const belowHero = config.website.homepage.below_hero
const belowTopics = config.website.homepage.below_topics
const topics = config.website.list_highlighted_topics
const buttons = config.website.home_buttons
const showTopicChart = config.website.show_topic_charts
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
          <span v-html="markdown.render(homepageSubTitle)" />
        </div>
      </div>
      <div class="search-bar" v-if="searchConfig.display">
        <DsfrSearchBar
          button-text="Rechercher"
          :placeholder="searchConfig.placeholder"
          :large="false"
          @search="doSearch"
          @update:modelValue="updateQuery"
          class="search-bar-input"
          :style="
            secondarySearchConfig.display
              ? 'min-width: 80%;'
              : 'min-width: 100%;'
          "
        />
        <div v-if="secondarySearchConfig.display" class="or-sep">ou</div>
        <div
          v-if="secondarySearchConfig.display"
          @click="goToPage(secondarySearchConfig.link)"
          class="button-search-guided"
        >
          {{ secondarySearchConfig.name }}
        </div>
      </div>
    </div>
  </div>
  <div
    class="fr-container hero-text"
    v-if="belowHero"
    v-html="markdown.render(belowHero)"
  ></div>
  <div class="fr-container">
    <HomeThemes
      v-if="config.themes"
      :selected-theme-name="$route.query.theme"
    />
    <HomeTopics v-if="topics" :topics="topics" />
    <HomeCharts v-if="showTopicChart" />
  </div>
  <div
    class="fr-container hero-text"
    v-if="belowTopics"
    v-html="markdown.render(belowTopics)"
  ></div>
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
.es__hero {
  font-size: 1.5rem;
  line-height: 1.5rem;
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

.hero-text {
  margin-top: 30px;
  text-align: left;
}
.subtitle {
  text-align: left;
  font-style: italic;
  font-size: 20px;
  line-height: 28px;
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

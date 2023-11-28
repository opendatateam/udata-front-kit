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

const homepageTitle = config.website.homepage_title
const homepageSubTitle = config.website.homepage_subtitle
const topics = config.website.list_highlighted_topics
const buttons = config.website.home_buttons
const showTopicChart = config.website.show_topic_charts
const colorsBanner = config.website.home_banner_colors
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
      <h1 class="main-title">{{ homepageTitle }}</h1>
      <div class="subtitle fr-mt-4w fr-mb-4w">
        <span v-html="markdown.render(homepageSubTitle)" />
      </div>
      <div class="search-bar">
        <DsfrSearchBar
          button-text="Rechercher"
          placeholder="Rechercher un jeu de données"
          :large="true"
          @search="doSearch"
          @update:modelValue="updateQuery"
        />
      </div>
    </div>
  </div>
  <div class="fr-container width-inherit">
    <HomeThemes
      v-if="config.themes"
      class-name="home-tile-list"
      :selected-theme-name="$route.query.theme"
    />
    <HomeButtons v-if="buttons" :buttons="buttons" />
    <HomeTopics v-if="topics" :topics="topics" />
    <HomeCharts v-if="showTopicChart" />
  </div>
</template>

<style scoped lang="scss">
.fr-container {
  text-align: center;
}
.es__hero {
  font-size: 1.5rem;
  line-height: 1.5rem;
}
.banner {
  padding-top: 5%;
  padding-bottom: 5%;
}
.main-title {
  text-align: left;
  font-size: 48px;
  line-height: 50px;
  font-weight: bold;
}
.subtitle {
  text-align: left;
  font-size: 20px;
  line-height: 28px;
  font-style: italic;
}
.search-bar {
  padding: 20px;
  background-color: white;
  border-radius: 10px;
}
</style>

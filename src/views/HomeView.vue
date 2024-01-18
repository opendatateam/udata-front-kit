<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'

import HomeButtons from '../components/HomeButtons.vue'
import HomeCharts from '../components/HomeCharts.vue'
import HomeTopics from '../components/HomeTopics.vue'
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

const homepageTitle = config.website.homepage_title
const homepageSubTitle = config.website.homepage_subtitle
const topics = config.website.list_highlighted_topics
const buttons = config.website.home_buttons
const showTopicChart = config.website.show_topic_charts
const colorsBanner = config.website.home_banner_colors
const searchConfig = config.website.search_bar
const secondarySearchConfig = config.website.secondary_search
const textbelowbanner = config.website.homepage_text_below_hero
const textbelowtopics = config.website.homepage_text_below_topics

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
      <div class="subtitle fr-text--alt fr-mb-10w">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="fromMarkdown(homepageSubTitle)" />
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
  <div
    class="fr-container hero-text"
    v-if="textbelowbanner.display"
    v-html="textbelowbanner.html"
  ></div>
  <div class="fr-container">
    <HomeButtons v-if="buttons" :buttons="buttons" />
    <HomeTopics v-if="topics" :topics="topics" />
    <HomeCharts v-if="showTopicChart" />
  </div>
  <div
    class="fr-container hero-text"
    v-if="textbelowtopics.display"
    v-html="textbelowtopics.html"
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

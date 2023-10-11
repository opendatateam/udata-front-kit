<script setup>
import { ref, computed, watchEffect } from "vue"
import { useRouter } from "vue-router"
import MarkdownIt from "markdown-it"
import config from "@/config"
import LineChart from "../components/LineChart.vue"
import { useChartStore } from "../store/ChartStore"
import { useTopicStore } from "../store/TopicStore"

const router = useRouter()
const query = ref("")
const markdown = new MarkdownIt()

// TODO: mutualize w/ App.vue
const updateQuery = (q) => {
  query.value = q
}
const doSearch = () => {
  router.push({name: "datasets", query: {q: query.value}})
}
const goToPage = (page) => {
  window.location.href = page
}

const chartStore = useChartStore()
const topicStore = useTopicStore()

const homepageTitle = ref(config.website__homepage_title)
const homepageSubTitle = ref(config.website__homepage_subtitle)
const topics = ref(config.website__list_highlighted_topics)
const buttons = ref(config.website__home_buttons)
const showTopicChart = ref(config.website__show_topic_charts)
const chartData = computed(() => chartStore.data)
const topicsData = computed(() => topicStore.data)

watchEffect(() => {
  chartStore.getCharts("topics", config.universe_topic_id)
  if(topics.value) {
    topicStore.getTopics(topics.value)
  }
})

</script>

<template>
  <div class="fr-container fr-mt-8w fr-mb-16w">
    <h1>{{ homepageTitle }}</h1>
    <div class="es__hero fr-mt-4w fr-mb-4w">
      <span v-html="markdown.render(homepageSubTitle)" />
    </div>
    <DsfrSearchBar
      button-text="Rechercher"
      placeholder="Rechercher un jeu de données"
      :large="true"
      @search="doSearch"
      @update:modelValue="updateQuery"
    />
    <div v-if="buttons">
      <br /><br />
      <div
        style="display: flex; justify-content: center; align-items: flex-start"
      >
        <div
          v-for="but in buttons"
          v-bind:key="but.name"
          class="button-home"
          @click="goToPage(but.link)"
        >
          <img :src="but.img" width="70" />
          <p class="button-name">{{ but.title }}</p>
        </div>
      </div>
      <br />
    </div>
    <div v-if="topicsData.length > 0">
      <br /><br />
      <h2 style="text-align: left">Les thématiques de données</h2>
      <div style="display: flex; flex-flow: row wrap; margin: auto">
        <div
          v-for="topic in topicsData"
          v-bind:key="topic.id"
          style="
            width: 350px;
            height: 430px;
            margin-left: 30px;
            margin-top: 30px;
          "
        >
          <DsfrCard
            :detail="topic.extras.tagline"
            :description="topic.description"
            :imgSrc="topic.extras.logo"
            :link="'/datasets?topic=' + topic.id"
            :title="topic.name"
            size="medium"
          />
        </div>
      </div>
    </div>
    <div v-if="showTopicChart && chartData">
      <div v-for="item in chartData" v-bind:key="item">
        <br /><br />
        <h2 style="text-align: left">{{ item.name }}</h2>
        <p style="text-align: left">{{ item.description }}</p>
        <div
          v-if="item.charts"
          style="
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
          "
        >
          <div
            v-for="chart in item.charts"
            v-bind:key="chart.url"
            style="width: 40%"
          >
            <LineChart :dataurl="chart.url" />
          </div>
        </div>
      </div>
    </div>
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
.button-home {
  width: 200px;
  height: 150;
  margin-left: 30px;
  margin-top: 30px;
  padding-top: 10px;
}

.button-home:hover {
  background-color: #ebebeb;
  cursor: pointer;
}

.button-name {
  color: #060091;
}
</style>

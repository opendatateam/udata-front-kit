<script setup>
import { ref, onMounted } from "vue"
import { useTopicStore } from "../store/TopicStore"
import config from "@/config"
import ChartData from "../components/ChartData.vue"

const topicStore = useTopicStore()
const chartData = ref([])

onMounted(() => {
  topicStore.getTopic(config.universe_topic_id).then(topic => {
    chartData.value = topic.extras["config:charts"] || []
  })
})
</script>

<template>
  <div v-if="chartData.length">
    <ChartData :chart-data="chartData"></ChartData>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import config from '@/config'

import ChartData from '../components/ChartData.vue'
import { useTopicStore } from '../store/TopicStore'

const topicStore = useTopicStore()
const chartData = ref([])

onMounted(() => {
  topicStore.load(config.website.topic_charts.topic).then((topic) => {
    chartData.value = topic.extras['config:charts'] || []
  })
})
</script>

<template>
  <div v-if="chartData.length">
    <ChartData :chart-data="chartData"></ChartData>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'

import { useTopicStore } from '../store/TopicStore'

const topicStore = useTopicStore()

const props = defineProps(['topics'])
const topics = props.topics

const topicsData = computed(() => topicStore.data)

onMounted(() => {
  topicStore.loadTopicsFromList(topics)
})

const goToPage = (page) => {
  window.location.href = page
}
</script>

<template>
  <div v-if="topicsData.length">
    <br /><br />
    <h2 class="section-title">THÉMATIQUES</h2>
    <div style="display: flex; flex-flow: row wrap; margin: auto">
      <div
        v-for="topic in topicsData"
        :key="topic.id"
        class="topic-card"
        @click="goToPage('/datasets?topic=' + topic.id)"
      >
        <div class="topic-title">{{ topic.name }}</div>
        <div class="topic-description">{{ topic.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  text-align: left;
  font-size: 20px;
}
.topic-card {
  min-width: 500px;
  width: 45%;
  height: 100%;
  margin-right: 30px;
  margin-top: 30px;
  border: 1px solid #ebebeb;
  padding: 20px;
  text-align: left;
  min-height: 180px;
  border-bottom: 3px solid #3557a2;
}
.topic-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  min-height: 50px;
}
.topic-card:hover {
  cursor: pointer;
  background-color: #ebebeb;
}
</style>

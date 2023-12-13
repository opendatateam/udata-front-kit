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
  <div v-if="topicsData.length" class="datagouv-components fr-mt-5w">
    <h2 class="subtitle subtitle--uppercase text-align-left">Thématiques</h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div v-for="topic in topicsData" class="fr-col-12 fr-col-md-6">
        <div
          class="topic-card"
          @click="goToPage('/datasets?topic=' + topic.id)"
        >
          <div class="topic-title">{{ topic.name }}</div>
          <div class="topic-description">{{ topic.description }}</div>
        </div>
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
  height: 100%;
  border: 1px solid #ebebeb;
  padding: 20px;
  text-align: left;
  min-height: 190px;
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

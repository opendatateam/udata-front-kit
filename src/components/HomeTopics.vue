<script setup>
import { onMounted, computed } from 'vue'

import config from '@/config'

import TopicDataCard from '../components/topics/TopicDataCard.vue'
import TopicDataTile from '../components/topics/TopicDataTile.vue'
import { useTopicStore } from '../store/TopicStore'

const topicStore = useTopicStore()

const props = defineProps(['topics'])
const topics = props.topics
const typeHighlightedTopics = config.website.type_highlighted_topics

const topicsData = computed(() => topicStore.data)

onMounted(() => {
  topicStore.loadTopicsFromList(topics)
})
const urlHighlightedTopics = config.website.url_highlighted_topics

const goToPage = (page) => {
  window.location.href = page
}
</script>

<template>
  <div>
    <div v-if="typeHighlightedTopics == 'card'">
      <TopicDataCard
        :topicsData="topicsData"
        :urlHighlightedTopics="urlHighlightedTopics"
      />
    </div>
    <div v-if="typeHighlightedTopics == 'tile'">
      <TopicDataTile
        :topicsData="topicsData"
        :urlHighlightedTopics="urlHighlightedTopics"
      />
    </div>
  </div>
</template>

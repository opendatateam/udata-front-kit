<script setup>
import { onMounted, computed } from "vue"
import { useTopicStore } from "../store/TopicStore"

const topicStore = useTopicStore()

const props = defineProps(["topics"])
const topics = props.topics

const topicsData = computed(() => topicStore.data)

onMounted(() => {
  // TODO: merge with BouquetStore
  topicStore.getTopics(topics)
})
</script>

<template>
  <div v-if="topicsData.length">
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
</template>

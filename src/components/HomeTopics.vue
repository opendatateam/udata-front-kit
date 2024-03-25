<script setup>
import { onMounted, computed } from 'vue'

import config from '@/config'

import { useTopicStore } from '../store/TopicStore'

const topicStore = useTopicStore()

const props = defineProps(['topics'])
const topics = props.topics
const type_highlighted_topics = config.website.type_highlighted_topics

const topicsData = computed(() => topicStore.data)

onMounted(() => {
  topicStore.loadTopicsFromList(topics)
})

const goToPage = (page) => {
  window.location.href = page
}

const url_highlighted_topics = config.website.url_highlighted_topics
</script>

<template>
  <div>
    <div v-if="type_highlighted_topics == 'card'">
      <br />
      <div style="display: flex; flex-wrap: wrap">
        <span v-for="topic in topicsData" v-bind:key="topic.id">
          <DsfrCard
            style="width: 350px; margin-right: 30px; margin-bottom: 50px"
            alt-img="altImg"
            :description="topic.extras['udata-front-kit:short_description']"
            :img-src="topic.extras['udata-front-kit:topic_image']"
            :link="'/' + url_highlighted_topics + '?topic=' + topic.id"
            :title="topic.name"
          />
        </span>
      </div>
    </div>
    <div v-if="type_highlighted_topics == 'tile'">
      <div v-if="topicsData.length" class="datagouv-components fr-mt-5w">
        <h2 class="subtitle subtitle--uppercase text-align-left">
          Thématiques
        </h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div v-for="topic in topicsData" class="fr-col-12 fr-col-md-6">
            <div
              class="topic-card"
              @click="
                goToPage('/' + url_highlighted_topics + '?topic=' + topic.id)
              "
            >
              <div class="topic-title">{{ topic.name }}</div>
              <div
                v-if="
                  topic.extras &&
                  topic.extras['udata-front-kit:short_description']
                "
                class="topic-description"
              >
                {{ topic.extras['udata-front-kit:short_description'] }}
              </div>
              <div v-else class="topic-description">
                {{ topic.description }}
              </div>
            </div>
          </div>
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

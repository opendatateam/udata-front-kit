<template>
  <div v-if="topic === undefined" class="loading">
    Chargement du cas d'usage en cours...
  </div>
  <div v-else class="test__cas-d-usage-related-card">
    <div class="fr-tile fr-tile--horizontal fr-enlarge-link">
      <div class="fr-tile__body">
        <div class="fr-tile__content">
          <h3 class="fr-tile__title">
            <router-link
              :to="{
                name: 'cas-d-usages_detail',
                params: { item_id: topic.slug }
              }"
              class="cas-d-usage-link"
            >
              {{ topic.name }}
            </router-link>
          </h3>
          <p class="fr-tile__detail">
            {{ topic.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import TopicsAPI from '../simplifionsTopicsApi'

const props = defineProps<{
  casUsageId: number
}>()

const topicsAPI = new TopicsAPI({ version: 2 })
const topic = ref<Topic | undefined>(undefined)
const casUsageTag = `simplifions-v2-cas-d-usages-${props.casUsageId}`

topicsAPI.getTopicByTag(casUsageTag).then((data) => {
  topic.value = data as Topic
})
</script>

<style scoped></style>

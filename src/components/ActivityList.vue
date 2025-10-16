<script setup lang="ts">
import type { Activity } from '@/model/activity'
import { useCurrentPageConf } from '@/router/utils'
import ActivityListComponent from '@datagouv/components-next/src/components/ActivityList/ActivityList.vue'

const props = defineProps({
  topicId: {
    type: String,
    required: true
  }
})

const { pageConf } = useCurrentPageConf()

const getActivityTranslation = (activity: Activity) => {
  switch (activity.key) {
    case 'topic:created':
      return `a créé le ${pageConf.labels.singular}`
    case 'topic:updated':
      return `a modifié le ${pageConf.labels.singular}`
    case 'topic:element:created':
      return `a ajouté un facteur au ${pageConf.labels.singular}`
    case 'topic:element:updated':
      return `a modifié un facteur du ${pageConf.labels.singular}`
    case 'topic:element:deleted':
      return `a supprimé un facteur du ${pageConf.labels.singular}`
    default:
      return activity.label
  }
}
</script>

<template>
  <Suspense>
    <ActivityListComponent :id="topicId">
      <template #activity="{ activity }">
        {{ getActivityTranslation(activity) }}
      </template>
    </ActivityListComponent>
    <template #fallback>
      <div class="fr-grid-row fr-grid-row--middle fr-mt-5w">
        <div class="fr-col-12 text-center">
          <p>Chargement de l'activité...</p>
        </div>
      </div>
    </template>
  </Suspense>
</template>

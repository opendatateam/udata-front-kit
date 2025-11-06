<script setup lang="ts">
import type { Activity } from '@/model/activity'
import type { ResolvedFactor, Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { ActivityList as ActivityListComponent } from '@datagouv/components-next'
import { useRouter } from 'vue-router'

const props = defineProps<{
  topic: Topic
  factors: ResolvedFactor[]
}>()

const router = useRouter()
const { pageConf } = useCurrentPageConf()

const getActivityTranslation = (activity: Activity) => {
  const elementId = getElementId(activity)
  switch (activity.key) {
    case 'topic:created':
      return `a créé le ${pageConf.labels.singular}`
    case 'topic:updated':
      return `a modifié le ${pageConf.labels.singular}`
    case 'topic:element:created':
      return `a ajouté un facteur au ${pageConf.labels.singular} (${elementId})`
    case 'topic:element:updated':
      return `a modifié un facteur du ${pageConf.labels.singular} (${elementId})`
    case 'topic:element:deleted':
      return `a supprimé un facteur du ${pageConf.labels.singular} (${elementId})`
    default:
      return activity.label
  }
}

const isActiveFactorActivity = (activity: Activity) => {
  return (
    isActiveFactor(getElementId(activity)) &&
    ['topic:element:created', 'topic:element:updated'].includes(activity.key)
  )
}

const getElementId = (activity: Activity): string | null => {
  return (activity.extras?.element_id as string) || null
}

const isActiveFactor = (elementId: string | null): boolean => {
  if (elementId == null) return false
  return !!props.factors.find((factor) => factor.id === elementId)
}

const handleActivityClick = (activity: Activity) => {
  const elementId = getElementId(activity)
  if (!elementId || !isActiveFactorActivity(activity)) return
  // Update URL hash - parent will watch for this change
  router.replace({ hash: `#factor-${elementId}` })
}
</script>

<template>
  <Suspense>
    <ActivityListComponent :id="topic.id">
      <template #activity="{ activity }">
        <button
          v-if="isActiveFactorActivity(activity)"
          type="button"
          class="activity-link"
          @click="handleActivityClick(activity)"
        >
          {{ getActivityTranslation(activity) }}
        </button>
        <span v-else>
          {{ getActivityTranslation(activity) }}
        </span>
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

<style scoped>
.activity-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  text-align: left;
}

.activity-link:hover {
  text-decoration: underline;
}
</style>

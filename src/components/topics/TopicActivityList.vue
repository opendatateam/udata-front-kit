<script setup lang="ts">
import type { Activity } from '@/model/activity'
import type { ResolvedFactor, Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import { ActivityList as ActivityListComponent } from '@datagouv/components-next'

const props = defineProps<{
  topic: Topic
  factors: ResolvedFactor[]
}>()

const { pageConf } = useCurrentPageConf()

const getActivityTranslation = (activity: Activity) => {
  const elementId = getElementId(activity)
  const activeFactor = getFactor(elementId)
  switch (activity.key) {
    case 'topic:created':
      return `a créé le ${pageConf.labels.singular}`
    case 'topic:updated':
      return `a modifié le ${pageConf.labels.singular}`
    case 'topic:element:created':
      if (activeFactor)
        return `a ajouté le facteur "${activeFactor.title}" au ${pageConf.labels.singular} (${elementId})`
      return `a ajouté un facteur au ${pageConf.labels.singular} (${elementId})`
    case 'topic:element:updated':
      if (activeFactor)
        return `a modifié le facteur "${activeFactor.title}" du ${pageConf.labels.singular} (${elementId})`
      return `a modifié un facteur du ${pageConf.labels.singular} (${elementId})`
    case 'topic:element:deleted':
      return `a supprimé un facteur du ${pageConf.labels.singular} (${elementId})`
    default:
      return activity.label
  }
}

/*
 * Is activity is about a factor that still exists (not deleted)?
 */
const isFactorActivity = (activity: Activity) => {
  return (
    getFactor(getElementId(activity)) &&
    ['topic:element:created', 'topic:element:updated'].includes(activity.key)
  )
}

const getElementId = (activity: Activity): string | null => {
  return (activity.extras?.element_id as string) || null
}

const getFactor = (elementId: string | null): ResolvedFactor | undefined => {
  if (elementId == null) return
  return props.factors.find((factor) => factor.id === elementId)
}

const emit = defineEmits<{
  navigateToFactor: [elementId: string]
}>()

const handleActivityClick = (activity: Activity) => {
  const elementId = getElementId(activity)
  if (!elementId || !isFactorActivity(activity)) return
  // Emit event to parent to handle navigation directly
  emit('navigateToFactor', elementId)
}

const getFactorHash = (activity: Activity): string => {
  const elementId = getElementId(activity)
  return elementId ? `#factor-${elementId}` : '#'
}
</script>

<template>
  <Suspense>
    <ActivityListComponent :id="topic.id">
      <template #activity="{ activity }">
        <a
          v-if="isFactorActivity(activity)"
          :href="getFactorHash(activity)"
          class="activity-link"
          @click.prevent.stop="handleActivityClick(activity)"
        >
          {{ getActivityTranslation(activity) }}
        </a>
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

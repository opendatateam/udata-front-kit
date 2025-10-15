<script setup lang="ts">
import type { Activity } from '@/model/activity'
import { useCurrentPageConf } from '@/router/utils'
import { useActivityStore } from '@/store/ActivityStore'
import { useFormatDate } from '@datagouv/components-next'
import Avatar from '@datagouv/components-next/src/components/Avatar.vue'

const props = defineProps({
  topicId: {
    type: String,
    required: true
  }
})

const { formatDate } = useFormatDate()

const { pageConf } = useCurrentPageConf()
const store = useActivityStore()
const currentPage = ref(1)

const activities = computed(() =>
  store.getActivitiesForObject(props.topicId, currentPage.value)
)
const pagination = computed(() => store.getPaginationForObject(props.topicId))

const groupedActivities = computed(() =>
  activities?.value?.data.reduce(
    (grouped, activity) => {
      const activityMonth = formatDate(activity.created_at, {
        dateStyle: undefined,
        day: undefined,
        month: 'long',
        year: 'numeric'
      })
      if (!grouped[activityMonth]) {
        grouped[activityMonth] = []
      }
      grouped[activityMonth].push(activity)
      return grouped
    },
    {} as Record<string, Array<Activity>>
  )
)

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

watch(
  currentPage,
  () => {
    store.loadActivitiesForObject(props.topicId, currentPage.value)
  },
  { immediate: true }
)
</script>

<template>
  <div
    v-if="!activities?.total"
    class="fr-grid-row flex-direction-column fr-grid-row--middle fr-mt-5w"
  >
    <img
      src="/static/blank_state/reuse.svg"
      alt=""
      loading="lazy"
      height="105"
      width="130"
    />
    <p class="fr-h6 fr-mt-2w fr-mb-5v text-center">
      Aucune activité pour ce {{ pageConf.labels.singular }}.
    </p>
  </div>
  <div v-else>
    <h2 class="fr-mt-4w">Activité</h2>
    <div
      v-for="(monthlyActivities, month) in groupedActivities"
      :key="month"
      class="my-1"
    >
      <p class="pl-3 mb-1 text-xs text-gray-medium">
        {{ month }}
      </p>
      <ul class="space-y-2 p-0 m-0">
        <li
          v-for="(activity, activityIndex) in monthlyActivities"
          :key="`${activity.key}${activity.created_at}`"
          class="relative flex"
        >
          <div
            :class="[
              activityIndex === activities.data.length - 1
                ? 'h-6'
                : '-bottom-6',
              'absolute left-0 top-0 flex w-6 justify-center'
            ]"
          >
            <div class="w-px bg-gray-silver" />
          </div>
          <div
            class="relative flex size-6 flex-none items-center justify-center bg-white"
          >
            <div class="size-[7px] rounded-full bg-gray-silver" />
          </div>
          <div class="flex w-full gap-x-3 items-start">
            <div class="flex items-center">
              <Avatar
                :rounded="true"
                :size="16"
                :user="activity.actor"
                class="block"
              />
              <p class="m-0 text-xs font-bold ml-0.5 text-gray-title">
                {{ activity.actor.first_name }}
                {{ activity.actor.last_name }}
              </p>
            </div>
            <details v-if="activity.changes.length" class="flex-1">
              <summary class="m-0 text-xs text-gray-title">
                {{ getActivityTranslation(activity) }}
              </summary>
              <p class="m-2 text-xs">
                {{
                  `1 champ${activity.changes?.length > 1 ? 's' : ''} mis à jour :`
                }}
              </p>
              <div class="font-mono text-xs rounded-sm bg-gray-some p-4 m-2">
                <ul class="list-['-'] pl-2 m-0">
                  <li
                    v-for="change in activity.changes"
                    :key="change"
                    class="pl-1"
                  >
                    {{ change }}
                  </li>
                </ul>
              </div>
            </details>
            <p v-else class="m-0 text-xs text-gray-title flex-1">
              {{ getActivityTranslation(activity) }}
            </p>
            <p class="m-0 text-xs text-gray-medium">
              {{ $t('le {date}', { date: formatDate(activity.created_at) }) }}
            </p>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="pagination?.length > 1" class="fr-container">
      <DsfrPagination
        :current-page="currentPage - 1"
        :pages="pagination"
        @update:current-page="(p: number) => (currentPage = p + 1)"
      />
    </div>
  </div>
</template>

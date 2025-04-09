<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'

import { type Reuse, type ReuseType } from '@/model/reuse'
import type { Topic } from '@/model/topic'
import { useRouteMeta } from '@/router/utils'
import ReusesAPI from '@/services/api/resources/ReusesAPI'
import { useReuseStore } from '@/store/ReuseStore'
import { useTopicStore } from '@/store/TopicStore'
import { formatDate } from '@/utils'
import { usePageConf } from '@/utils/config'

const props = defineProps({
  model: {
    type: String as () => 'dataset' | 'topic',
    required: true
  },
  objectId: {
    type: String,
    required: true
  }
})

const pageConf = usePageConf(useRouteMeta().pageKey || `${props.model}s`)
const reuseStore = useReuseStore()
const reuseApi = new ReusesAPI()
const reuses: Ref<Reuse[]> = ref([])
const types: Ref<ReuseType[]> = ref([])

const crop = (value: string) => {
  return value.length <= 40 ? value : `${value.slice(0, 40)}...`
}

const reuseDescription = (r: Reuse) => {
  const desc = `Publié le ${formatDate(r.created_at, true)}`
  if (r.organization?.name) {
    return `${desc} par ${r.organization?.name}`
  } else {
    return `${desc} par ${r.owner?.first_name} ${r.owner?.last_name}`
  }
}

const getType = (id: string) => {
  const type = types.value.find((t) => t.id === id)
  return type?.label || ''
}

onMounted(() => {
  switch (props.model) {
    case 'dataset':
      reuseStore
        .loadReusesForDataset(props.objectId)
        .then((r) => (reuses.value = r))
      break
    case 'topic':
      useTopicStore()
        .load(props.objectId)
        .then((t: Topic) => {
          reuseApi
            .getReusesFromRel(t.reuses)
            .then((data) => (reuses.value = data))
        })
      break
    default:
      break
  }
  reuseStore.getTypes().then((data) => {
    types.value = data
  })
})
</script>

<template>
  <div
    v-if="!reuses.length"
    class="fr-grid-row flex-direction-column fr-grid-row--middle fr-mt-5w"
  >
    <img
      src="/blank_state/reuse.svg"
      alt=""
      loading="lazy"
      height="105"
      width="130"
    />
    <p class="fr-h6 fr-mt-2w fr-mb-5v text-center">
      Il n'y a pas encore de réutilisation pour ce
      {{ pageConf.object.singular }}.
    </p>
    <p>
      <a
        class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--secondary-grey-500 fr-ml-1w"
        href="https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/reutilisations"
      >
        Qu'est-ce qu'une réutilisation ?
      </a>
    </p>
  </div>
  <div v-else>
    <h2 class="fr-mt-4w">Réutilisations</h2>
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li
        v-for="r in reuses"
        :key="r.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-3"
      >
        <DsfrCard
          :link="r.page"
          :style="`max-width: 400px; max-height: 400px`"
          :title="crop(r.title)"
          :detail="getType(r.type)"
          :description="reuseDescription(r)"
          size="sm"
          :img-src="
            r.image_thumbnail ||
            r.organization?.logo ||
            r.owner?.avatar ||
            undefined
          "
        />
      </li>
    </ul>
  </div>
</template>

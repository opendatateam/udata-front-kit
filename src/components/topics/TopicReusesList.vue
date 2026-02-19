<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ReuseCard, type Reuse } from '@datagouv/components-next'

import BlankState from '@/components/BlankState.vue'
import type { Topic } from '@/model/topic'
import { useCurrentPageConf } from '@/router/utils'
import ReusesAPI from '@/services/api/resources/ReusesAPI'

const props = defineProps({
  topic: {
    type: Object as () => Topic,
    required: true
  }
})

const { pageConf } = useCurrentPageConf()
const reusesAPI = new ReusesAPI()
const reuses = ref<Reuse[]>([])

onMounted(() => {
  reusesAPI
    .getReusesFromElementsRel(props.topic.elements)
    .then((data) => (reuses.value = data))
})
</script>

<template>
  <div v-if="reuses.length > 0">
    <h2 class="fr-mt-4w subtitle subtitle--uppercase">
      {{ reuses.length }}
      {{ reuses.length > 1 ? 'réutilisations' : 'réutilisation' }}
    </h2>
    <ul class="fr-grid-row fr-grid-row--gutters fr-mt-2w fr-pl-0" role="list">
      <li
        v-for="reuse in reuses"
        :key="reuse.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4"
      >
        <ReuseCard :reuse="reuse" :reuse-url="reuse.page" />
      </li>
    </ul>
  </div>
  <BlankState
    v-else
    image="/static/blank_state/reuse.svg"
    :message="`Il n'y a pas encore de réutilisation pour ce ${pageConf.labels.singular}.`"
  >
    <p>
      <a
        class="fr-btn fr-btn--sm fr-btn--secondary fr-ml-1w"
        href="https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/reutilisations"
      >
        Qu'est-ce qu'une réutilisation ?
      </a>
    </p>
  </BlankState>
</template>

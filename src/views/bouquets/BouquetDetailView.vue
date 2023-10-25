<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import config from '@/config'

import Tile from '../../components/Tile.vue'
import { useDatasetStore } from '../../store/DatasetStore'
import { useTopicStore } from '../../store/TopicStore'
import { useUserStore } from '../../store/UserStore'
import { descriptionFromMarkdown } from '../../utils'

const route = useRoute()
const router = useRouter()
const store = useTopicStore()
const userStore = useUserStore()
const datasetStore = useDatasetStore()
const bouquet = ref({})
const datasets = ref([])

const description = computed(() => descriptionFromMarkdown(bouquet))

const goToEdit = () => {
  router.push({ name: 'bouquet_edit', params: { bid: bouquet.value.slug } })
}

const canEdit = computed(() => {
  return (
    userStore.isAdmin() ||
    (userStore.$state.isLoggedIn &&
      bouquet.value.owner?.id === userStore.$state.data?.id)
  )
})

onMounted(() => {
  store.load(route.params.bid).then((res) => {
    bouquet.value = res
    datasetStore
      .loadMultiple(bouquet.value.datasets.map((d) => d.id))
      .then((ds) => (datasets.value = ds))
  })
})

</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <h1>{{ bouquet.name }}</h1>
    <div v-html="description"></div>
    <div v-if="bouquet.extras && bouquet.extras[`${config.universe.name}:informations`]">
      <div v-for="info in bouquet.extras[`${config.universe.name}:informations`]">
        <h5>Thématique</h5>
        <p>{{ info.theme }}</p>
        <h5>Chantier</h5>
        <p>{{ info.subtheme }}</p>
      </div>
    </div>

    <h2 class="fr-mt-2w">Jeux de données</h2>
    <div v-if="!datasets.length">Pas de jeu de données dans ce bouquet.</div>
    <ul v-else class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li v-for="d in datasets" class="fr-col-12 fr-col-lg-4">
        <Tile
          :link="`/datasets/${d.slug}`"
          :title="d.title"
          :description="d.description"
          :img="d.organization.logo"
          :is-markdown="true"
          :notice="
            bouquet.extras[`${config.universe.name}:${d.id}:description`]
          "
        />
      </li>
    </ul>
    <DsfrButton
      v-if="canEdit"
      class="fr-mt-4w"
      label="Modifier le bouquet"
      icon="ri-pencil-line"
      @click="goToEdit"
    />
  </div>
</template>

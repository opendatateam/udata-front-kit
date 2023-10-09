<script setup>
import { onMounted, ref, computed } from "vue"
import { useRoute, useRouter } from "vue-router"

import { useBouquetStore } from "../../store/BouquetStore"
import { useDatasetStore } from "../../store/DatasetStore"
import { useUserStore } from "../../store/UserStore"
import { descriptionFromMarkdown } from "../../utils"
import Tile from "../../components/Tile.vue"

const route = useRoute()
const router = useRouter()
const store = useBouquetStore()
const userStore = useUserStore()
const datasetStore = useDatasetStore()
const bouquet = ref({})
const datasets = ref([])

const description = computed(() => descriptionFromMarkdown(bouquet))

const goToEdit = () => {
  router.push({name: "bouquet_edit", params: { bid: bouquet.slug }},)
}

onMounted(() => {
  store.load(route.params.bid).then(res => {
    bouquet.value = res
    datasetStore.loadMultiple(
      bouquet.value.datasets.map(d => d.id)
    ).then(ds => datasets.value = ds)
  })
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <h1>{{ bouquet.name }}</h1>
    <div v-html="description"></div>

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
        />
      </li>
    </ul>
    <DsfrButton
      class="fr-mt-4w"
      v-if="userStore.isAdmin()"
      label="Modifier le bouquet"
      icon="ri-pencil-line"
      @click="goToEdit"
    />
  </div>
</template>

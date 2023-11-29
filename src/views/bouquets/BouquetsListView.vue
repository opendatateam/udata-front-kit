<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Tile from '@/components/Tile.vue'
import { useLoader } from '@/composables/loader'
import { useTopicStore } from '@/store/TopicStore'

const router = useRouter()

const store = useTopicStore()
const bouquets = computed(() => store.data)
const loadTopics = useLoader(store.loadTopicsForUniverse)

const goToCreate = () => {
  router.push({ name: 'bouquet_add' })
}

onMounted(() => {
  loadTopics()
})
</script>

<template>
  <div class="fr-container width-inherit fr-container--fluid fr-mt-4w fr-mb-4w">
    <div class="fr-grid-row fr-mb-1w">
      <DsfrButton
        class="fr-mb-1w"
        label="Ajouter un bouquet"
        icon="ri-add-circle-line"
        @click="goToCreate"
      />
    </div>
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-mt-1w">
      <li v-for="bouquet in bouquets" class="fr-col-12 fr-col-lg-4">
        <Tile
          :link="`/bouquets/${bouquet.slug}`"
          :title="bouquet.name"
          :description="bouquet.description"
          :is-markdown="true"
        />
      </li>
    </ul>
  </div>
</template>

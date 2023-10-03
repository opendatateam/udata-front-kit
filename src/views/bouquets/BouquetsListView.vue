<script setup>
import { onMounted, computed } from "vue"
import { useBouquetStore } from "../../store/BouquetStore"
import { useLoading } from "vue-loading-overlay"
import Tile from "../../components/Tile.vue"

const store = useBouquetStore()
const $loading = useLoading()

const bouquets = computed(() => store.$state.data)

onMounted(() => {
  const loader = $loading.show()
  store.loadBouquets().finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
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

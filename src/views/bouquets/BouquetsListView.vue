<script setup>
import { onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useBouquetStore } from "../../store/BouquetStore"
import { useUserStore } from "../../store/UserStore"
import { useLoading } from "vue-loading-overlay"
import Tile from "../../components/Tile.vue"

const store = useBouquetStore()
const userStore = useUserStore()
const $loading = useLoading()
const router = useRouter()

const bouquets = computed(() => store.$state.data)

const isAdmin = computed(() => userStore.$state.isLoggedIn && userStore.$state.data?.roles?.includes("admin"))

const goToCreate = () => {
  router.push({name: "bouquet_add"})
}

onMounted(() => {
  const loader = $loading.show()
  store.loadBouquets().finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <DsfrButton
      class="fr-mb-2w"
      v-if="isAdmin"
      label="Ajouter un bouquet"
      icon="ri-add-circle-line"
      @click="goToCreate"
    />
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

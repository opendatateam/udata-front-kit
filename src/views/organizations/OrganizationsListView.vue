<script setup>
import { ref, computed, onMounted } from "vue"
import { useOrganizationStore } from "../../store/OrganizationStore"
import Tile from "../../components/Tile.vue"

const store = useOrganizationStore()

const currentPage = ref(1)
const pages = store.getPagination()
const organizations = computed(() => store.getForPage(currentPage.value))

function onUpdatePage (page) {
  currentPage.value = page + 1
  store.loadFromConfig(currentPage.value)
}

onMounted(() => {
  store.loadFromConfig()
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li v-for="org in organizations" class="fr-col-12 fr-col-lg-4">
        <Tile
          :link="`/organizations/${org.slug}`"
          :title="org.name"
          :description="org.description"
          :img="org.logo"
        />
      </li>
    </ul>
  </div>
  <DsfrPagination v-if="pages.length" :current-page="currentPage - 1" :pages="pages" @update:current-page="onUpdatePage" />
</template>

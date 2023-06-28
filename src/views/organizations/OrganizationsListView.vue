<script setup>
import { ref, computed, onMounted } from "vue"
import { useOrganizationStore } from "../../store"
import Card from "../../components/Card.vue"

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
    <div class="fr-grid-row fr-grid-row--gutters">
      <Card v-for="org in organizations"
        class="fr-col-5 fr-m-2w"
        :alt-img="org.name"
        :link="`/organizations/${org.slug}`"
        :title="org.name"
        :description="org.description"
        :img="org.logo"
      />
    </div>
  </div>
  <DsfrPagination v-if="pages.length" :current-page="currentPage - 1" :pages="pages" @update:current-page="onUpdatePage" />
</template>

<script setup>
import { ref, computed } from "vue"
import { useOrganizationStore } from "../../store"
import Card from "../../components/Card.vue"

const store = useOrganizationStore()

const currentPage = ref(1)
const pages = store.getPagination()
const organizations = computed(() => store.getOrAddListFromConfig(currentPage.value))

function onUpdatePage (page) {
  currentPage.value = page + 1
}
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <!-- we're using `.value` here since api.data is a ref wrapped in a ref (?) -->
      <Card v-for="org in organizations"
        class="fr-col-5 fr-m-2w"
        :alt-img="org.value.name"
        :link="`/organizations/${org.value.slug}`"
        :title="org.value.name"
        :description="org.value.description"
        :img="org.value.logo"
      />
    </div>
  </div>
  <DsfrPagination v-if="pages.length" :current-page="currentPage - 1" :pages="pages" @update:current-page="onUpdatePage" />
</template>

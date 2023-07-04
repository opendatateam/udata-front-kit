<script setup>
import { ref } from "vue"
import { RouterView } from "vue-router"
import { useRouter } from "vue-router"
import Navigation from "./components/Navigation.vue"

const router = useRouter()
const query = ref("")

const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  router.push({name: "datasets", query: {q: query.value}})
}

</script>

<template>
  <DsfrHeader
    service-title="Ecosphères"
    service-description="Guichet unique des données ministérielles"
    home-to="/"
    :quick-links="[]"
    :show-search="true"
    @search="doSearch"
    @update:modelValue="updateQuery"
    logo-text="MINISTÈRES<br>
      TRANSITION ÉCOLOGIQUE<br>
      COHÉSION DES TERRITOIRES<br>
      TRANSITION ÉNERGÉTIQUE<br>
      MER"
  />

  <div class="fr-header__body">
    <div class="fr-container  width-inherit">
      <Navigation />
      <RouterView />
    </div>
  </div>

  <DsfrFooter class="fr-mt-8w" :mandatory-links="[]"></DsfrFooter>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const query = ref("");

// TODO: mutualize w/ App.vue
const updateQuery = (q) => {
  query.value = q;
};
const doSearch = () => {
  router.push({ name: "datasets", query: { q: query.value } });
};
</script>

<template>
  <div class="fr-container fr-mt-16w fr-mb-16w">
    <h1>Ecosphères</h1>
    <div class="es__hero fr-mt-4w fr-mb-4w">
      Explorez les données ouvertes et restreintes de la
      <strong>Transition écologique</strong>, de la
      <strong>Cohésion des territoires</strong>, de la
      <strong>Transition énergétique</strong> et de la <strong>Mer</strong>
    </div>
    <DsfrSearchBar
      button-text="Rechercher"
      placeholder="Rechercher un jeu de données"
      :large="true"
      @search="doSearch"
      @update:modelValue="updateQuery"
    />
  </div>
</template>

<style scoped lang="scss">
.fr-container {
  text-align: center;
}
.es__hero {
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>

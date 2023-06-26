<script setup>
import { useOrganizationStore } from "../../store"
import Card from "../../components/Card.vue"

const store = useOrganizationStore()
const organizations = store.fillFromConfig()
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
</template>

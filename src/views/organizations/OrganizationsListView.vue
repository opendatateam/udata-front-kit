<script setup>
import { useOrganizationStore } from "../../store";

const store = useOrganizationStore()
const organizations = store.fillFromConfig()
</script>

<template>
  <div v-for="org in organizations">
    <!-- we're using `.value` here since api.data is a ref wrapped in a ref (?) -->
    <DsfrCard
      style="max-width: 400px;"
      :alt-img="org.value.name"
      :detail="org.value.acronym"
      :description="org.value.description"
      :img-src="org.value.logo"
      :link="`/organizations/${org.value.slug}`"
      :title="org.value.name"
      :horizontal="false"
      :no-arrow="false"
    />
  </div>
</template>

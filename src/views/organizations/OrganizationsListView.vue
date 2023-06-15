<script setup>
import { reactive, onMounted } from "vue";
import API from "../../services/api/resources/Organizations"
import config from "@/config.js"

const api = new API()
const organization_ids = config.organizations
// TODO: move to store
const localOrganizations = reactive([])

onMounted(() => {
  // TODO: handle loading state
  // TODO: use computed property?
  organization_ids.forEach(oid => {
    const { data, error } = api.get(oid)
    localOrganizations.push(data)
  })
})
</script>

<template>
  <div v-for="org in localOrganizations">
    <!-- we're using `.value` here since api.data is a ref -->
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

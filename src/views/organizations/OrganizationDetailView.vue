<script setup>
import { useRoute } from "vue-router"

import { useOrganizationStore } from "../../store"

const route = useRoute()
const store = useOrganizationStore()

const org = store.getOrAdd(route.params.oid)
</script>

<template>
  <h1>{{ org.name }}</h1>
  <div>{{ org.description }}</div>
</template>

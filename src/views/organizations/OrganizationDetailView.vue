<script setup>
import { useRoute } from "vue-router"

import API from "../../services/api/resources/Organizations"

const route = useRoute()
const api = new API()

const { data, error } =  api.get(route.params.oid)
</script>

<template>
  <h1>{{ data.name }}</h1>
  <div>{{ data.description }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import config from '@/config'

const router = useRouter()

defineProps({
  searchLabel: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['search'])

const placeholder = config.website.header_search.placeholder
const query = ref('')

const doSearch = () => {
  router.push({ path: '/datasets', query: { q: query.value } })
  query.value = ''
  emits('search')
}
</script>

<template>
  <DsfrSearchBar
    v-model="query"
    :label="searchLabel"
    :placeholder="placeholder"
    @search="doSearch"
  />
</template>

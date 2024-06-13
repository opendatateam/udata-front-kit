<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  searchLabel: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['search'])

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

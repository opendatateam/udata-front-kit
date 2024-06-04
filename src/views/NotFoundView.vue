<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

if (route.name !== 'not_found') {
  router.push({ name: 'not_found' })
}
</script>

<template>
  <div class="fr-container fr-mt-4w">Page non trouvée.</div>
</template>

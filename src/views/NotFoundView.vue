<script setup>
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'

const route = useRoute()
const router = useRouter()

if (route.name !== 'not_found') {
  router.push({ name: 'not_found' })
}
</script>

<template>
  <GenericContainer class="fr-mt-4w">Page non trouvée.</GenericContainer>
</template>

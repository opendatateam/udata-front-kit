<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import AuthService from '@/services/AuthService'
import { useUserStore } from '@/store/UserStore'

const router = useRouter()
const store = useUserStore()
const auth = new AuthService()
const token = computed(() => store.$state.token)

onMounted(() => {
  if (token.value) {
    auth.logout(token.value).then(() => {
      store.logout()
      console.log('Logged out')
      // reload to clean up stores
      location.reload()
    })
  } else {
    router.push({ name: 'home' })
  }
})
</script>

<template>
  <GenericContainer class="fr-mt-4w">
    Déconnexion en cours...
  </GenericContainer>
</template>

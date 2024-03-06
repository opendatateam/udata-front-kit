<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import AuthService from '../services/AuthService'
import { useUserStore } from '../store/UserStore'

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
  <div class="fr-container about">
    <h1>This is a logout page</h1>
  </div>
</template>

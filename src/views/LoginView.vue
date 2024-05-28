<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthService from '@/services/AuthService'
import LocalStorageService from '@/services/LocalStorageService'
import UserAPI from '@/services/api/resources/UserAPI'
import { useUserStore } from '@/store/UserStore'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const auth = new AuthService()
const api = new UserAPI()

onMounted(() => {
  if (!store.$state.isLoggedIn && !route.query.code) {
    auth.getRedirectURL().then((url) => {
      window.location.href = url
    })
  } else if (route.query.code) {
    // Exchange the authorization code for an access token
    auth.retrieveToken(route.query.code, route.query.state).then((token) => {
      auth.cleanup()
      store.login(token)
      api.list().then((data) => {
        store.storeInfo(data)
      })
      const lastRoute = LocalStorageService.getItem('lastRoute')
      const next = lastRoute ?? { name: 'home' }
      LocalStorageService.removeItem('lastRoute')
      router.push(next)
    })
  } else {
    console.log('Logged in!')
    router.push({ name: 'home' })
  }
})
</script>

<template>
  <div class="fr-container fr-mt-4w">Connexion en cours...</div>
</template>

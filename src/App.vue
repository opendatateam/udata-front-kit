<script setup>
import { ref, computed, onMounted } from "vue"
import { RouterView, useRouter } from "vue-router"
import { useUserStore } from "./store/UserStore"
import UserAPI from "./services/api/resources/UserAPI"
import Navigation from "./components/Navigation.vue"

const router = useRouter()
const query = ref("")
const api = new UserAPI()
const store = useUserStore()

const isLoggedIn = computed(() => store.$state.isLoggedIn)

const quickLinks = computed(() => {
  return [
    {
      label: isLoggedIn.value ? `${store.$state.data.first_name} ${store.$state.data.last_name}` : "Se connecter",
      icon: isLoggedIn.value ? "ri-logout-box-r-line" : "ri-account-circle-line",
      to: isLoggedIn.value ? "/logout" : "/login",
      iconRight: isLoggedIn.value,
    }
  ]
})

const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  router.push({name: "datasets", query: {q: query.value}})
}

onMounted(() => {
  store.init()
  if (isLoggedIn.value) {
    api.getProfile().then(data => {
      store.storeInfo(data)
    }).catch(() => {
      // getProfile has failed, we're probably using a bad token
      // keep the current route and redirect to the login flow
      // TODO: handle this as a response interceptor on 401?
      store.logout()
      localStorage.setItem("lastPath", router.currentRoute.value.path)
      router.push({name: "login"})
    })
  }
})
</script>

<template>
  <DsfrHeader
    service-title="Ecosphères"
    service-description=""
    home-to="/"
    :quick-links="quickLinks"
    :show-search="true"
    @search="doSearch"
    @update:modelValue="updateQuery"
    logo-text="MINISTÈRES<br>
      TRANSITION ÉCOLOGIQUE<br>
      COHÉSION DES TERRITOIRES<br>
      TRANSITION ÉNERGÉTIQUE<br>
      MER"
  />

  <div class="fr-header__body">
    <div class="fr-container  width-inherit">
      <Navigation />
      <RouterView />
    </div>
  </div>

  <DsfrFooter class="fr-mt-8w" :mandatory-links="[]"></DsfrFooter>
</template>

<!-- global styles -->
<style lang="scss">
.es__tiles__list {
  list-style-type: none;
}
.justify-end {
  justify-content: flex-end;
}
</style>

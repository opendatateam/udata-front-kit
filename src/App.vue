<script setup>
import { ref, computed, onMounted } from "vue"
import { RouterView, useRouter } from "vue-router"
import { useUserStore } from "./store/UserStore"
import UserAPI from "./services/api/resources/UserAPI"
import Navigation from "./components/Navigation.vue"
import config from "@/config"

const router = useRouter()
const query = ref("")
const api = new UserAPI()
const store = useUserStore()

const isLoggedIn = computed(() => store.$state.isLoggedIn)

const quickLinks = computed(() => {
  if(config.website__oauth_option) {
    return [
      {
        label: isLoggedIn.value ? `${store.$state.data.first_name} ${store.$state.data.last_name}` : "Se connecter",
        icon: isLoggedIn.value ? "ri-logout-box-r-line" : "ri-account-circle-line",
        to: isLoggedIn.value ? "/logout" : "/login",
        iconRight: isLoggedIn.value,
      }
    ]
  } else {
    return
  }
})

const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  console.log(query.value)
  router.push({path: "/datasets", query: {q: query.value}})
}

// protect authenticated routes
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !store.$state.isLoggedIn) {
    localStorage.setItem("lastPath", to.path)
    router.push({name: "login"})
  }
})

onMounted(() => {
  store.init()
  if (isLoggedIn.value) {
    api._list().then(data => {
      store.storeInfo(data)
    }).catch(err => {
      // profile info fetching has failed, we're probably using a bad token
      // keep the current route and redirect to the login flow
      if (err.response?.status === 401) {
        store.logout()
        localStorage.setItem("lastPath", router.currentRoute.value.path)
        return router.push({name: "login"})
      }
      throw err
    })
  }
})

const logotext = ref(config.website__rf_title)
const servicetitle = ref(config.website__title)
const logoOperator = ref(config.website__logo_operator)

</script>

<template>
  <DsfrHeader
    :service-title="servicetitle"
    service-description=""
    home-to="/"
    :quick-links="quickLinks"
    :show-search="true"
    @search="doSearch"
    @update:modelValue="updateQuery"
    :logo-text="logotext"
    :operatorImgSrc="logoOperator"
    :operatorImgStyle="{ height: '60px' }"
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

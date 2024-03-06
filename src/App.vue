<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import config from '@/config'

import Navigation from './components/Navigation.vue'
import Header from './components/header/Header.vue'
import { useUserStore } from './store/UserStore'

const router = useRouter()
const query = ref('')
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.$state.isLoggedIn)

const quickLinks = computed(() => {
  const button = config.website.header_button

  const headerButton = {
    label: button.label,
    icon: 'ri-lightbulb-line',
    href: button.link
  }

  const userLink = {
    label: isLoggedIn.value
      ? `${userStore.$state.data?.first_name} ${userStore.$state.data?.last_name}`
      : 'Se connecter',
    icon: isLoggedIn.value ? 'ri-logout-box-r-line' : 'ri-account-circle-line',
    to: isLoggedIn.value ? '/logout' : '/login',
    iconRight: isLoggedIn.value
  }

  if (!config.website.oauth_option) {
    return button.display ? [headerButton] : []
  }

  return button.display ? [headerButton, userLink] : [userLink]
})

const updateQuery = (q) => {
  query.value = q
}

const doSearch = () => {
  router.push({ path: '/datasets', query: { q: query.value } })
}

onMounted(() => {
  userStore.init()
})

const logotext = ref(config.website.rf_title)
const servicetitle = ref(config.website.title)
const logoOperator = ref(config.website.logo_operator)
const logoService = ref(config.website.service_logo)
const showBadge = ref(config.website.badge.display)
const badgeText = ref(config.website.badge.text)
const badgeStyle = ref(config.website.badge.style)
const footerPhrase = ref(config.website.footer_phrase)
const footerExternalLinks = ref(config.website.footer_external_links)
const footerMandatoryLinks = ref(config.website.footer_mandatory_links)
const headerSearch = ref(config.website.header_search)
</script>

<template>
  <Header
    :service-title="servicetitle"
    service-description=""
    home-to="/"
    :quick-links="quickLinks"
    :show-search="true"
    :logo-text="logotext"
    :operator-img-src="logoOperator"
    :operator-img-style="{ height: '60px', width: '60px' }"
    :service-logo-src="logoService"
    :show-badge="showBadge"
    :badge-text="badgeText"
    :badge-style="badgeStyle"
    :showSearch="headerSearch"
    @search="doSearch"
    @update:model-value="updateQuery"
  >
    <template #mainnav="{ hidemodal }">
      <Navigation :on-click="hidemodal" />
    </template>
  </Header>

  <RouterView />

  <DsfrFooter
    class="fr-mt-16w"
    :logo-text="logotext"
    :operator-img-src="logoOperator"
    :operator-img-style="{ height: '92px', width: '92px' }"
    :service-logo-src="logoService"
    :desc-text="footerPhrase"
    :ecosystem-links="footerExternalLinks"
    :mandatory-links="footerMandatoryLinks"
  />
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

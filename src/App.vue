<script setup lang="ts">
import { useFocus } from '@vueuse/core'
import { computed, onMounted, provide, ref, watch, type Ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import config from '@/config'

import LiveRegion, { type InfoToAnnounce } from './components/LiveRegion.vue'
import Navigation from './components/Navigation.vue'
import SkipLinks, { type SkipLinksProps } from './components/SkipLinks.vue'
import Header from './components/header/HeaderComponent.vue'
import { useUserStore } from './store/UserStore'
import { fromMarkdown } from './utils'

const userStore = useUserStore()
const isNoticeClosed = ref(false)

const skipLinks: SkipLinksProps['links'] = [
  {
    id: 'main-content',
    text: 'Aller au contenu'
  },
  {
    id: 'main-nav',
    text: 'Aller au menu principal'
  }
]
const liveInfos: Ref<InfoToAnnounce[] | undefined> = ref()

const noticeContent = computed(() => {
  if (!config.website.notice?.display) return
  return fromMarkdown(config.website.notice?.content)
})

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

onMounted(() => {
  userStore.init()
})

const logotext = config.website.rf_title
const servicetitle = config.website.title
const logoOperator = config.website.logo_operator
const logoService = config.website.service_logo
const showBadge = config.website.badge.display
const badgeText = config.website.badge.text
const badgeStyle = config.website.badge.style
const footerPhrase = config.website.footer_phrase
const footerExternalLinks = config.website.footer_external_links
const footerMandatoryLinks = config.website.footer_mandatory_links

const route = useRoute()
const skipLinksComp = ref<InstanceType<typeof SkipLinks> | null>(null)

const setAccessibilityProperties: Function = (title: string) => {
  // announce page title to screen reader
  liveInfos.value = [{ text: `Page ${title}` }]
  // focus skip link
  if (skipLinksComp.value?.firstSkipLink) {
    const { focused } = useFocus(skipLinksComp.value?.firstSkipLink[0])
    focused.value = true
  }
}

// change title on custom page title
// const setAccessibilityProperties: Function = (value: string) => {
//   setAccessibilityProperties(value)
// }
provide('setAccessibilityProperties', setAccessibilityProperties)

// watch route change and update title
watch(
  () => route.path,
  () => {
    if (route.meta.title) {
      const title = route.meta.title as string
      setAccessibilityProperties(title)
    }
  },
  { immediate: true }
)
</script>

<template>
  <SkipLinks ref="skipLinksComp" :links="skipLinks" />
  <LiveRegion v-if="liveInfos" :infos="liveInfos" aria-live-mode="assertive" />
  <DsfrNotice
    v-if="!isNoticeClosed && noticeContent"
    :closeable="config.website.notice?.closeable ? true : null"
    @close="isNoticeClosed = true"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="noticeContent"></div>
  </DsfrNotice>
  <Header
    :service-title="servicetitle"
    service-description=""
    home-to="/"
    :quick-links="quickLinks"
    :show-search="config.website.header_search.display"
    :logo-text="logotext"
    :operator-img-src="logoOperator"
    :operator-img-style="{ height: '60px', width: '60px' }"
    :service-logo-src="logoService"
    :show-badge="showBadge"
    :badge-text="badgeText"
    :badge-style="badgeStyle"
  >
    <template #mainnav="{ hidemodal }">
      <Navigation :on-click="hidemodal" />
    </template>
  </Header>

  <main id="main-content" role="main">
    <RouterView />
  </main>

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

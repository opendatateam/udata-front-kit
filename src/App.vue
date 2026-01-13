<script setup lang="ts">
import { useTitle } from '@vueuse/core'

import config from '@/config'

import type { InfoToAnnounce } from './components/LiveRegion.vue'
import SkipLinks, { type SkipLinksProps } from './components/SkipLinks.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from './model/injectionKeys'
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

const userName = computed(() => userStore.userName)
const quickLinks = computed(() => {
  const headerButton = config.website.header.button.display
    ? {
        label: config.website.header.button.label,
        icon: 'fr-icon-lightbulb-line',
        href: config.website.header.button.link,
        iconRight: true
      }
    : null

  const adminShorcut =
    config.website.header.admin_shortcut && isLoggedIn.value
      ? {
          label: 'Administration',
          icon: 'fr-icon-settings-5-line',
          href: `${config.datagouvfr.base_url}/admin`,
          iconRight: true
        }
      : null

  const userProfile = isLoggedIn.value
    ? {
        button: true,
        disabled: true,
        label: userName.value,
        icon: 'fr-icon-account-circle-line',
        iconRight: true
      }
    : null

  const logLink = config.website.oauth_option
    ? {
        label: isLoggedIn.value ? 'Déconnexion' : 'Se connecter',
        icon: isLoggedIn.value
          ? 'fr-icon-logout-box-r-line'
          : 'fr-icon-account-circle-line',
        to: isLoggedIn.value ? '/logout' : '/login',
        iconRight: true
      }
    : null

  const buttons = [userProfile, headerButton, adminShorcut, logLink]

  return buttons.filter((button) => button !== null)
})

onMounted(() => {
  userStore.init()
})

const logoService = config.website.service_logo
const logoText = config.website.rf_title
const serviceTitle = config.website.title
const logoOperator = config.website.logo_operator?.src
const logoOperatorHeight = config.website.logo_operator?.header?.height
const logoOperatorWidth = config.website.logo_operator?.header?.width
const footerPhrase = config.website.footer_phrase
const footerExternalLinks = config.website.footer_external_links
const footerMandatoryLinks = config.website.footer_mandatory_links

const route = useRoute()
const skipLinksComp =
  useTemplateRef<InstanceType<typeof SkipLinks>>('skipLinksComp')

const setAccessibilityProperties: AccessibilityPropertiesType = (
  title,
  focus = true,
  messages = []
): void => {
  useTitle(`${title} | ${config.website.title}`)
  // announce page title to screen reader
  if (title) {
    liveInfos.value = [
      { text: `Page ${title} | ${config.website.title}` },
      ...messages
    ]
  }
  // focus skip link container
  if (focus && skipLinksComp.value?.skipLinkList) {
    skipLinksComp.value.skipLinkList.focus()
  }
}

provide(AccessibilityPropertiesKey, setAccessibilityProperties)

// watch route change and update title
watch(
  () => route.path,
  () => {
    if (route.meta.title) {
      const title = route.meta.title
      setAccessibilityProperties(title)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div id="tooltips" />
  <SkipLinks ref="skipLinksComp" :links="skipLinks" />
  <LiveRegion v-if="liveInfos" :infos="liveInfos" aria-live-mode="assertive" />
  <DsfrNotice
    v-if="!isNoticeClosed && noticeContent"
    :closeable="config.website.notice?.closeable ? true : undefined"
    @close="isNoticeClosed = true"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="noticeContent"></div>
  </DsfrNotice>
  <HeaderComponent
    :user-name="userName"
    :quick-links="quickLinks"
    :logo-operator-height
    :logo-operator-width
    :custom-search="true"
  />

  <main id="main-content" role="main">
    <RouterView />
  </main>

  <DsfrFooter
    class="fr-mt-16w"
    :logo-text="logoText"
    :operator-img-src="logoOperator"
    :operator-img-style="{
      height: logoOperatorHeight,
      width: logoOperatorWidth
    }"
    :service-logo-src="logoService"
    :desc-text="footerPhrase"
    :ecosystem-links="footerExternalLinks"
    :mandatory-links="footerMandatoryLinks"
    :home-title="`Retour à l'accueil du site - ${serviceTitle}`"
  />
</template>

<!-- global styles -->
<style>
.es__tiles__list {
  list-style-type: none;
}
.justify-end {
  justify-content: flex-end;
}

.fr-footer__brand-link {
  box-sizing: content-box;
}
.fr-footer__logo {
  max-width: 100%;
}
</style>

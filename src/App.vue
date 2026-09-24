<script setup lang="ts">
import { Toaster } from '@datagouv/components-next'

import config, { rawConfig } from '@/config'

import { DsfrFooter } from '@gouvminint/vue-dsfr'
import ConfigDebugPanel from './components/ConfigDebugPanel.vue'
import HeaderComponent from './components/header/HeaderComponent.vue'
import type { InfoToAnnounce } from './components/LiveRegion.vue'
import LiveRegion from './components/LiveRegion.vue'
import SkipLinks, { type SkipLinksProps } from './components/SkipLinks.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from './model/injectionKeys'
import { useUserStore } from './store/UserStore'
import { fromMarkdown } from './utils'
import { useWebsiteConfig } from './utils/config'
import { diffConfig } from './utils/configDiff'

const userStore = useUserStore()

// "Did this browser already have a customised config when the page
// loaded?" — deliberately evaluated once, not a computed. `config` is
// already seeded from localStorage by the time App.vue runs (see
// @/config.ts), so a one-shot diff against the pristine config.yaml
// answers exactly that, and stays stable for the session.
//
// Reactive would be wrong here: creating a universe in the wizard's step 1
// writes pages.datasets.universe_query.topic (null in the shipped default
// config), which would flip this mid-wizard and make the "Assistant de
// démarrage" header entry vanish while the user is still inside it.
const hasLocalConfig = diffConfig(rawConfig, config).length > 0
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
  return fromMarkdown(config.website.notice?.content, true).html
})

const siteID = computed(() => config.site_id)
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

  // The wizard is for the initial bootstrap only — once a local config
  // exists (Save, Albert, or the wizard's own propose_config all persist
  // one), it's no longer a "fresh site" and offering it again is
  // confusing at best, actively misleading at worst (its config step's
  // prompt assumes it's the first customization pass).
  const bootstrapWizardLink =
    config.website.header.show_bootstrap_wizard && !hasLocalConfig
      ? {
          label: 'Assistant de démarrage',
          icon: 'fr-icon-magic-line',
          to: '/wizard',
          iconRight: true
        }
      : null

  // Hidden as standalone header buttons only while the wizard is offered —
  // it already links to both /editor and /universe inline, and surfacing
  // all three at once is more confusing than helpful. Once a local config
  // exists (wizard link gone), these reappear. The routes themselves stay
  // reachable either way.
  const configEditorLink =
    config.website.header.show_config_editor && !bootstrapWizardLink
      ? {
          label: 'Éditeur de config',
          icon: 'fr-icon-edit-line',
          to: '/editor',
          iconRight: true
        }
      : null

  const universeManagerLink =
    config.website.header.show_universe_manager && !bootstrapWizardLink
      ? {
          label: 'Mon univers',
          icon: 'fr-icon-database-line',
          to: '/universe',
          iconRight: true
        }
      : null

  const buttons = [
    userProfile,
    headerButton,
    adminShorcut,
    bootstrapWizardLink,
    configEditorLink,
    universeManagerLink,
    logLink
  ]

  return buttons.filter((button) => button !== null)
})

onMounted(() => {
  userStore.init()
})

const websiteConfig = useWebsiteConfig()
const footer = computed(() => websiteConfig.footer)
const rf_title = computed(() => websiteConfig.rf_title)
const title = computed(() => websiteConfig.title)
const logo = computed(() => footer.value.logo)
const phrase = computed(() => footer.value.phrase)
const external_links = computed(() => footer.value.external_links)
const mandatory_links = computed(() => footer.value.mandatory_links)

const skipLinksComp =
  useTemplateRef<InstanceType<typeof SkipLinks>>('skipLinksComp')

const setAccessibilityProperties: AccessibilityPropertiesType = (
  title,
  focus = true,
  messages = []
): void => {
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
</script>

<template>
  <Toaster rich-colors />
  <div id="tooltips" />
  <SkipLinks ref="skipLinksComp" :links="skipLinks" />
  <LiveRegion v-if="liveInfos" :infos="liveInfos" aria-live-mode="assertive" />
  <DsfrNotice
    v-if="!isNoticeClosed && noticeContent"
    :closeable="config.website.notice?.closeable ? true : undefined"
    @close="isNoticeClosed = true"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-html="noticeContent"></span>
  </DsfrNotice>
  <HeaderComponent
    :user-name="userName"
    :quick-links="quickLinks"
    :custom-search="true"
  />

  <main id="main-content" :class="siteID" role="main">
    <RouterView />
  </main>

  <DsfrFooter
    :class="[siteID, 'fr-mt-16w']"
    :logo-text="rf_title"
    :operator-img-src="logo?.src"
    :operator-img-style="{
      height: logo?.height,
      width: logo?.width
    }"
    :desc-text="phrase"
    :ecosystem-links="external_links"
    :mandatory-links="mandatory_links"
    :home-title="`Retour à l'accueil du site - ${title}`"
  />

  <ConfigDebugPanel v-if="config.website.header.show_config_editor" />
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
.simplifions.fr-mt-16w,
.culture.fr-mt-16w {
  margin-top: 0 !important;
}
</style>

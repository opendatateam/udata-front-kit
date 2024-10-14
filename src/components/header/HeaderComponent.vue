<script lang="ts" setup>
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useSlots,
  type StyleValue
} from 'vue'

import type { DsfrHeaderMenuLinkProps } from './DsfrHeaderMenuLink.vue'
import HeaderSearch from './HeaderSearch.vue'

type DsfrHeaderProps = {
  serviceTitle?: string
  serviceDescription?: string
  serviceLogoSrc?: string
  homeTo?: string
  logoText?: string | string[]
  modelValue?: string
  operatorImgAlt?: string
  operatorImgSrc?: string
  operatorImgStyle?: StyleValue
  userName?: string
  quickLinks?: DsfrHeaderMenuLinkProps[]
  searchLabel?: string
  quickLinksAriaLabel?: string
  showSearch?: boolean
  showBadge?: boolean
  badgeText?: string
  badgeStyle?: string
}

const props = withDefaults(defineProps<DsfrHeaderProps>(), {
  serviceTitle: undefined,
  serviceDescription: undefined,
  homeTo: '/',
  logoText: () => 'Gouvernement',
  modelValue: '',
  operatorImgAlt: '',
  operatorImgSrc: '',
  operatorImgStyle: () => ({}),
  serviceLogoSrc: '',
  userName: undefined,
  quickLinks: () => [],
  searchLabel: 'Recherche',
  quickLinksAriaLabel: 'Menu secondaire',
  showBadge: false,
  badgeText: 'BETA',
  badgeStyle: ''
})

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    hideModal()
  }
}
onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})

const searchModalOpened = ref(false)
const headerModalOpened = ref(false)

const hideModal = (focusButtonMenu: boolean = true) => {
  headerModalOpened.value = false
  searchModalOpened.value = false
  if (focusButtonMenu) {
    document.getElementById('button-menu')?.focus()
  }
}
const showMenu = () => {
  headerModalOpened.value = true
  searchModalOpened.value = false
  document.getElementById('close-button')?.focus()
}
const showSearchModal = () => {
  headerModalOpened.value = false
  searchModalOpened.value = true
}
const onQuickLinkClick = hideModal

const slots = useSlots()
const isWithSlotOperator = computed(
  () => Boolean(slots.operator?.().length) || !!props.operatorImgSrc
)
const isWithSlotNav = computed(() => Boolean(slots.mainnav))

const badgeCss = 'fr-badge fr-badge--sm fr-badge--' + props.badgeStyle
</script>

<template>
  <header role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <DsfrLogo :logo-text="logoText" data-testid="header-logo" />
              </div>
              <div v-if="isWithSlotOperator" class="fr-header__operator">
                <!-- @slot Slot nommé operator pour le logo opérateur. Sera dans `<div class="fr-header__operator">` -->
                <slot name="operator">
                  <img
                    v-if="operatorImgSrc"
                    :src="operatorImgSrc"
                    :alt="operatorImgAlt"
                    class="fr-responsive-img"
                    :style="operatorImgStyle"
                  />
                </slot>
              </div>
              <div
                v-if="showSearch || isWithSlotNav || quickLinks?.length"
                class="fr-header__navbar"
              >
                <button
                  v-if="showSearch"
                  class="fr-btn fr-btn--search"
                  aria-controls="header-search"
                  :aria-expanded="searchModalOpened"
                  :data-fr-opened="searchModalOpened"
                  @click.prevent.stop="showSearchModal()"
                >
                  <span class="fr-sr-only">Recherche</span>
                </button>
                <button
                  v-if="isWithSlotNav || quickLinks?.length"
                  id="button-menu"
                  class="fr-btn--menu fr-btn"
                  aria-controls="header-navigation"
                  :aria-expanded="headerModalOpened"
                  :data-fr-opened="headerModalOpened"
                  data-testid="open-menu-btn"
                  @click.prevent.stop="showMenu()"
                >
                  <span class="fr-sr-only">Menu</span>
                </button>
              </div>
            </div>
            <div v-if="!serviceLogoSrc" class="fr-header__service">
              <RouterLink
                :to="homeTo"
                :title="`Accueil - ${serviceTitle}`"
                v-bind="$attrs"
              >
                <span class="fr-grid-row fr-header__service-title"
                  >{{ serviceTitle }}
                  <span v-if="showBadge" :class="badgeCss">
                    {{ badgeText }}
                  </span>
                </span>
              </RouterLink>
              <p v-if="serviceDescription" class="fr-header__service-tagline">
                {{ serviceDescription }}
              </p>
            </div>
            <div v-if="serviceLogoSrc" class="fr-header__service">
              <RouterLink
                :to="homeTo"
                :title="`Accueil - ${serviceTitle}`"
                v-bind="$attrs"
                class="fr-grid-row fr-header__service-title"
              >
                <img
                  :src="serviceLogoSrc"
                  :alt="serviceTitle"
                  class="fr-responsive-img service-logo"
                />

                <span v-if="showBadge" :class="badgeCss">{{ badgeText }}</span>
              </RouterLink>
            </div>
          </div>
          <div class="fr-header__tools">
            <div
              v-if="userName || quickLinks?.length"
              class="fr-header__tools-links"
            >
              <p v-if="userName" class="fr-py-1w">
                {{ userName }}
              </p>
              <DsfrHeaderMenuLinks
                v-if="!headerModalOpened && quickLinks?.length"
                :links="quickLinks"
                :nav-aria-label="quickLinksAriaLabel"
              />
            </div>
            <div v-if="showSearch" class="fr-header__search fr-modal">
              <HeaderSearch :search-label="searchLabel" />
            </div>
          </div>
        </div>

        <UseFocusTrap v-if="searchModalOpened">
          <div
            v-if="showSearch"
            id="header-search"
            class="fr-header__search fr-modal"
            :class="{ 'fr-modal--opened': searchModalOpened }"
            aria-label="Menu modal"
            role="dialog"
            aria-modal="true"
          >
            <div class="fr-container">
              <button
                id="close-button"
                class="fr-btn fr-btn--close"
                aria-controls="header-navigation"
                data-testid="close-modal-btn"
                @click.prevent.stop="hideModal()"
              >
                Fermer
              </button>
              <HeaderSearch
                v-if="searchModalOpened"
                :search-label="searchLabel"
                @search="hideModal(false)"
              />
            </div>
          </div>
        </UseFocusTrap>
        <UseFocusTrap v-if="headerModalOpened">
          <div
            v-if="
              isWithSlotNav || userName || (quickLinks && quickLinks.length)
            "
            id="header-navigation"
            class="fr-header__menu fr-modal"
            :class="{ 'fr-modal--opened': headerModalOpened }"
            aria-label="Fenêtre menu"
            role="dialog"
            aria-modal="true"
          >
            <div class="fr-container">
              <button
                id="close-button"
                class="fr-btn fr-btn--close"
                aria-controls="header-navigation"
                data-testid="close-modal-btn"
                @click.prevent.stop="hideModal()"
              >
                Fermer
              </button>
              <div class="fr-header__menu-links">
                <p v-if="userName" class="fr-py-1w">
                  {{ userName }}
                </p>
                <DsfrHeaderMenuLinks
                  v-if="headerModalOpened && quickLinks?.length"
                  role="navigation"
                  :links="quickLinks"
                  :nav-aria-label="quickLinksAriaLabel"
                  @link-click="onQuickLinkClick"
                />
              </div>
              <template v-if="headerModalOpened">
                <slot name="mainnav" :hidemodal="hideModal" />
              </template>
            </div>
          </div>
        </UseFocusTrap>
        <slot />
      </div>
    </div>
    <div
      v-if="isWithSlotNav && !headerModalOpened && !searchModalOpened"
      class="fr-hidden fr-unhidden-lg fr-header__menu"
    >
      <div class="fr-container">
        <!-- @slot Slot nommé mainnav pour le menu de navigation principal -->
        <slot name="mainnav" :hidemodal="hideModal" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.service-logo {
  height: 35px;
  margin: 0;
  width: auto;
}
.fr-header__service-title {
  align-items: center;
  gap: 0.25em;
}
</style>

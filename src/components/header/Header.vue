<script lang="ts" setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useSlots,
  type StyleValue
} from 'vue'

import type { DsfrHeaderMenuLinkProps } from './DSFRHeaderMenuLink.vue'

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
  placeholder?: string
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
  placeholder: 'Rechercher...',
  quickLinks: () => [],
  searchLabel: 'Recherche',
  quickLinksAriaLabel: 'Menu secondaire',
  showBadge: false,
  badgeText: 'BETA'
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

const hideModal = () => {
  headerModalOpened.value = false
  searchModalOpened.value = false
  document.getElementById('button-menu')?.focus()
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

// eslint-disable-next-line func-call-spacing
defineEmits<{
  (e: 'update:modelValue', payload: string): void
  (e: 'search', payload: string): void
}>()
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
                    class="fr-responsive-img"
                    :src="operatorImgSrc"
                    :alt="operatorImgAlt"
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
                  aria-label="Recherche"
                  title="Recherche"
                  :data-fr-opened="searchModalOpened"
                  @click.prevent.stop="showSearchModal()"
                />
                <button
                  v-if="isWithSlotNav || quickLinks?.length"
                  id="button-menu"
                  class="fr-btn--menu fr-btn"
                  :data-fr-opened="showMenu"
                  aria-controls="header-navigation"
                  aria-haspopup="menu"
                  aria-label="Menu"
                  title="Menu"
                  data-testid="open-menu-btn"
                  @click.prevent.stop="showMenu()"
                />
              </div>
            </div>
            <div v-if="!serviceLogoSrc" class="fr-header__service">
              <RouterLink
                :to="homeTo"
                :title="`Accueil - ${serviceTitle}`"
                v-bind="$attrs"
              >
                <p
                  class="fr-header__service-title"
                  style="margin-right: 0.75em"
                >
                  {{ serviceTitle }}
                  <span v-if="showBadge" :class="badgeCss">
                    {{ badgeText }}
                  </span>
                </p>
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
              >
                <div class="fr-grid-row">
                  <img
                    class="fr-responsive-img"
                    :src="serviceLogoSrc"
                    alt=""
                    style="
                      height: 35px;
                      margin-top: 0;
                      margin-bottom: 0;
                      margin-right: 0.75em;
                      width: auto;
                    "
                  />
                  <p v-if="showBadge" class="fr-header__service-title">
                    <span :class="badgeCss" style="margin: 0.5em">{{
                      badgeText
                    }}</span>
                  </p>
                </div>
              </RouterLink>
            </div>
          </div>
          <div class="fr-header__tools">
            <div v-if="quickLinks?.length" class="fr-header__tools-links">
              <nav role="navigation">
                <DsfrHeaderMenuLinks
                  v-if="!headerModalOpened"
                  class="fr-pb-4w"
                  :links="quickLinks"
                  :nav-aria-label="quickLinksAriaLabel"
                />
              </nav>
            </div>
            <div v-if="showSearch" class="fr-header__search fr-modal">
              <DsfrButton
                class="fr-ml-auto fr-mb-4v"
                label="Donnez votre avis"
                :secondary="true"
                icon="ri-lightbulb-line"
              />
              <DsfrSearchBar
                :label="searchLabel"
                :model-value="modelValue"
                :placeholder="placeholder"
                style="justify-content: flex-end"
                @update:model-value="$emit('update:modelValue', $event)"
                @search="$emit('search', $event)"
              />
            </div>
          </div>
        </div>
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
            <DsfrSearchBar
              v-if="searchModalOpened"
              :model-value="modelValue"
              :placeholder="placeholder"
              @update:model-value="$emit('update:modelValue', $event)"
              @search="$emit('search', $event)"
            />
          </div>
        </div>
        <div
          v-if="isWithSlotNav || (quickLinks && quickLinks.length)"
          id="header-navigation"
          class="fr-header__menu fr-modal"
          :class="{ 'fr-modal--opened': headerModalOpened }"
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
            <div class="fr-header__menu-links">
              <DsfrHeaderMenuLinks
                v-if="headerModalOpened"
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

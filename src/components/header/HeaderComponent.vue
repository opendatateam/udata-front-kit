<script lang="ts" setup>
import config from '@/config'
import { DsfrHeader, type DsfrHeaderProps } from '@gouvminint/vue-dsfr'
import Navigation from '../NavigationComponent.vue'
import SearchComponent from '../SearchComponent.vue'

type Props = {
  userName: string | undefined
  headerLogo: string | undefined
  headerLogoHeight: string | undefined
  headerLogoWidth: string | undefined
  customSearch: boolean
}

withDefaults(defineProps<DsfrHeaderProps & Props>(), {
  operatorImgAlt: '',
  operatorImgStyle: () => ({}),
  searchLabel: 'Rechercher',
  quickLinks: () => [],
  showSearch: config.website.header.search.display,
  customSearch: false
})

// DsfrHeader does not expose the hidemodal function, so we do this to close the modal after a custom search.
const headerRef = useTemplateRef<ComponentPublicInstance>('headerRef')

const closeModal = () => {
  const closeButton: HTMLButtonElement | undefined | null =
    headerRef.value?.$el.querySelector('#close-button')
  if (closeButton) {
    // we need a timeout because of a '@keydown.enter' in DsfrSearchBar preventing the click to happen
    setTimeout(() => {
      closeButton.click()
    }, 50)
  }
}

const logoText = config.website.rf_title
const serviceTitle = config.website.title
const serviceDescription = config.website.header.description ?? undefined
const titleImage = config.website.header.title_image?.src
const titleImageHeight = config.website.header.title_image?.height
const titleImageWidth = config.website.header.title_image?.width
const showBeta = config.website.header.beta
</script>

<template>
  <DsfrHeader
    ref="headerRef"
    home-to="/"
    :logo-text
    :service-title="titleImage ? undefined : serviceTitle"
    :service-description
    :quick-links
    :show-search="showSearch && !customSearch"
    :home-label="`Retour à l'accueil du site - ${serviceTitle}`"
    :show-beta
  >
    <!-- needed because of logo + title image -->
    <template v-if="headerLogo || titleImage" #operator>
      <div v-if="headerLogo">
        <img
          class="fr-responsive-img header-logo"
          :src="headerLogo"
          alt=""
          :style="operatorImgStyle"
          :height="headerLogoHeight"
          :width="headerLogoWidth"
        />
      </div>
      <div v-if="titleImage">
        <img
          class="fr-responsive-img title-image"
          :src="titleImage"
          :alt="serviceTitle"
          :height="titleImageHeight"
          :width="titleImageWidth"
        />
      </div>
    </template>

    <template #after-quick-links>
      <SearchComponent
        v-if="customSearch && showSearch"
        id="header-select-search"
        class="custom-search"
        :search-label="searchLabel"
        :placeholder="searchLabel"
        @do-search="closeModal"
      />
    </template>

    <!-- @vue-ignore FIXME: upstream bug, hidemodal is not typed in DsfrHeader slot props -->
    <template #mainnav="{ hidemodal }">
      <Navigation :on-click="hidemodal" />
    </template>
  </DsfrHeader>
</template>

<style scoped>
.header-logo,
.title-image {
  /* take values from config */
  --width: v-bind(headerLogoWidth);
  --height: v-bind(headerLogoHeight);
  /* if no cusotm values limit height to 35px */
  inline-size: var(--width, auto);
  block-size: var(--height, 35px);
  /* keep the original image ratio in case of wrong values */
  object-fit: contain;
}

.title-image {
  --width: v-bind(titleImageWidth);
  --height: v-bind(titleImageHeight);
}
:deep(.fr-header__brand-top) {
  flex-wrap: wrap;

  .fr-header__operator {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  @media (max-width: 62em) {
    .fr-header__operator {
      flex: 1 1 100%;
      padding-top: 0;
      order: 3;
    }
    .fr-header__navbar {
      margin-right: 0;
      align-self: center;
      order: 2;
    }
  }
}
:deep(.fr-header__tools-links) {
  flex-wrap: wrap;
  align-items: center;

  & > :last-child.custom-search {
    flex: 1 0 100%;
    max-inline-size: min(24rem, 100%);
  }
}
:deep(.custom-search) input + .fr-btn {
  background-color: var(--background-action-high-blue-france);
  color: var(--text-inverted-blue-france);

  &:hover {
    background-color: var(--hover-tint);
  }
}
</style>

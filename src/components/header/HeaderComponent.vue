<script lang="ts" setup>
import { useWebsiteConfig } from '@/utils/config'
import { DsfrHeader, type DsfrHeaderProps } from '@gouvminint/vue-dsfr'
import Navigation from '../NavigationComponent.vue'
import SearchComponent from '../SearchComponent.vue'

type Props = {
  userName: string | undefined
  customSearch: boolean
}

withDefaults(defineProps<DsfrHeaderProps & Props>(), {
  operatorImgAlt: '',
  operatorImgStyle: () => ({}),
  searchLabel: 'Rechercher',
  quickLinks: () => [],
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

const { header, rf_title, title } = useWebsiteConfig()
const { logo, title_image, description, beta, search } = header
</script>

<template>
  <DsfrHeader
    ref="headerRef"
    home-to="/"
    :logo-text="rf_title"
    :service-title="title_image ? undefined : title"
    :service-description="description"
    :quick-links
    :show-search="search.display && !customSearch"
    :home-label="`Retour à l'accueil du site - ${title}`"
    :show-beta="beta"
  >
    <!-- needed because of logo + title image -->
    <template v-if="logo || title_image" #operator>
      <div v-if="logo">
        <img
          class="fr-responsive-img header-logo"
          :src="logo.src"
          alt=""
          :style="operatorImgStyle"
          :height="logo.height"
          :width="logo.width"
        />
      </div>
      <div v-if="title_image">
        <img
          class="fr-responsive-img title-image"
          :src="title_image.src"
          :alt="title"
          :height="title_image.height"
          :width="title_image.width"
        />
      </div>
    </template>

    <template #after-quick-links>
      <SearchComponent
        v-if="customSearch && search.display"
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
  --width: v-bind(logo?.width);
  --height: v-bind(logo?.height);
  /* if no cusotm values limit height to 35px */
  inline-size: var(--width, auto);
  block-size: var(--height, 35px);
  /* keep the original image ratio in case of wrong values */
  object-fit: contain;
}

.title-image {
  --width: v-bind(title_image?.width);
  --height: v-bind(title_image?.height);
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
/* override green beta badge */
:deep(.fr-header__service .fr-badge) {
  background-color: var(--background-contrast-blue-cumulus);
  color: var(--text-label-blue-cumulus);
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

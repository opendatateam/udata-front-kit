<script lang="ts" setup>
import config from '@/config'
import type { DsfrHeaderProps } from '@gouvminint/vue-dsfr'
import Navigation from '../Navigation.vue'
import SearchComponent from '../SearchComponent.vue'
// import type { DsfrHeaderMenuLinkProps } from './DsfrHeaderMenuLink.vue'

interface Props {
  userName: string | undefined
}

withDefaults(defineProps<DsfrHeaderProps & Props>(), {
  operatorImgAlt: '',
  operatorImgStyle: () => ({}),
  searchLabel: 'Recherche',
  quickLinks: () => [],
  showSearch: config.website.header_search.display
})

const logoText = config.website.rf_title
const serviceTitle = config.website.title
const serviceLogo = config.website.service_logo
const logoOperator = config.website.logo_operator?.src
const logoOperatorHeight = config.website.logo_operator?.header?.height
const logoOperatorWidth = config.website.logo_operator?.header?.width
const showLogoOperatorInHeader = config.website.logo_operator?.show_in_header
const logoService = config.website.service_logo
const showBadge = config.website.badge.display
const badgeText = config.website.badge.text
const badgeStyle = config.website.badge.style
const dropdown = config.website.header_search.dropdown
</script>

<template>
  <DsfrHeader
    home-to="/"
    :logo-text
    :service-title="serviceLogo ? undefined : serviceTitle"
    :service-logo-src="showLogoOperatorInHeader ? undefined : logoService"
    :operator-img-src="showLogoOperatorInHeader ?? logoOperator"
    :operator-img-alt
    :operator-img-style
    service-description=""
    :quick-links
    :show-search
  >
    <!-- needed because of title style + badge -->
    <template #operator>
      <img
        v-if="showLogoOperatorInHeader && logoOperator"
        class="fr-responsive-img operator-logo"
        :src="logoOperator"
        alt=""
        :style="operatorImgStyle"
        :height="logoOperatorHeight"
        :width="logoOperatorWidth"
      />
      <img
        v-if="serviceLogo"
        class="fr-responsive-img service-logo"
        :src="serviceLogo"
        :alt="serviceTitle"
      />
      <span
        v-if="showBadge"
        :class="`fr-badge fr-badge--sm fr-badge--${badgeStyle}`"
      >
        {{ badgeText }}
      </span>
    </template>

    <template v-if="userName" #before-quick-links>
      <p class="fr-py-1w fr-mr-2v fr-text--sm">
        {{ userName }}
      </p>
    </template>

    <template #after-quick-links>
      <SearchComponent
        v-if="!showSearch"
        id="header-select-search"
        :search-label="searchLabel"
        :dropdown="dropdown"
        placeholder="Rechercher"
      />
    </template>

    <template #mainnav="{ hidemodal }">
      <Navigation :on-click="hidemodal" />
    </template>
  </DsfrHeader>
</template>

<style scoped>
.operator-logo {
  inline-size: v-bind(logoOperatorWidth);
  block-size: v-bind(logoOperatorHeight);
}
.service-logo {
  max-block-size: 35px;
}
:deep(.fr-header__brand-top) {
  flex-wrap: wrap;

  .fr-header__operator {
    display: flex;
    align-items: center;
    gap: 1rem;
    order: 3;
  }
  .fr-header__navbar {
    order: 2;
  }
}
:deep(.fr-header__tools-links) {
  flex-wrap: wrap;
  align-items: center;

  & > :last-child {
    flex: 1 0 50%;
    max-inline-size: min(24rem, 100%);
  }
}
</style>

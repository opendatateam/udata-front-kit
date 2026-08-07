<template>
  <div class="fr-my-2w fr-p-2w border border-default-grey">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-auto">
        <div class="logo">
          <OrganizationLogo
            v-if="dataset.organization"
            :organization="dataset.organization"
            size-class="size-10"
          />
          <Placeholder v-else type="Organization" class="size-10" />
        </div>
      </div>
      <div class="fr-col">
        <component
          :is="props.titleTag"
          class="fr-text--md fr-mb-0 fr-text-title--grey"
        >
          {{ dataset.title }}
        </component>
        <div
          v-if="dataset.organization"
          class="fr-text--sm fr-m-0 fr-grid-row fr-grid-row--middle"
        >
          <span class="org-name fr-mr-1v">
            <OrganizationNameWithCertificate
              :organization="dataset.organization"
              color-class="text-gray-title"
            />
          </span>
        </div>
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--right fr-mt-1w">
      <!-- Non-interactive: the clickable link is the ancestor <a> in SimplifionsDataApi.vue -->
      <span
        class="fr-link fr-link--sm fr-icon-external-link-line fr-link--icon-right"
      >
        Voir le jeu de données sur Data.gouv.fr
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  OrganizationLogo,
  OrganizationNameWithCertificate,
  Placeholder,
  type DatasetV2
} from '@datagouv/components-next'

interface Props {
  dataset: DatasetV2
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const props = withDefaults(defineProps<Props>(), {
  titleTag: 'h4'
})
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-default-grey {
  border: 1px solid var(--border-default-grey);
}

/* @datagouv/components-next defines .truncate with !important inside @layer utilities (Tailwind).
   Unlayered !important loses to layered !important, so we must be in the same layer to win the cascade. */
@layer utilities {
  .org-name :deep(.truncate) {
    overflow: visible !important;
    white-space: normal !important;
    text-overflow: clip !important;
  }
}
</style>

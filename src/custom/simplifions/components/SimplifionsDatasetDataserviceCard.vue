<template>
  <div class="fr-my-2w fr-p-2w border border-default-grey relative">
    <div
      v-if="accessType === 'restricted'"
      class="absolute top-0 fr-grid-row fr-grid-row--middle fr-mt-n3v fr-ml-n1v"
    >
      <p
        class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon fr-mr-1w"
      >
        <span
          class="fr-icon-lock-line fr-icon--xs fr-mr-1v"
          aria-hidden="true"
        ></span>
        API restreinte
      </p>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-auto">
        <div class="logo">
          <OrganizationLogo
            v-if="organization"
            :organization="organization"
            size-class="size-10"
          />
          <img
            v-else-if="owner"
            :src="ownerAvatarUrl!"
            alt=""
            loading="lazy"
            class="size-10 border owner-avatar"
          />
          <Placeholder v-else type="Organization" class="size-10" />
        </div>
      </div>
      <div class="fr-col">
        <component
          :is="props.titleTag"
          class="fr-text--md fr-mb-0 fr-text-title--grey"
        >
          {{ title }}
        </component>
        <div
          v-if="organization || owner"
          class="fr-text--sm fr-m-0 fr-grid-row fr-grid-row--middle"
        >
          <span class="org-name fr-mr-1v">
            <OrganizationNameWithCertificate
              v-if="organization"
              :organization="organization"
              color-class="text-gray-title"
            />
            <template v-else>{{ ownerName }}</template>
          </span>
          <span
            v-if="owner && !organization"
            class="fr-text--xs text-mention-grey fr-m-0"
          >
            · Producteur individuel
          </span>
        </div>
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--right fr-mt-1w">
      <!-- Non-interactive: the clickable link is the ancestor <a> in SimplifionsDataApi.vue -->
      <span
        class="fr-link fr-link--sm fr-icon-external-link-line fr-link--icon-right"
      >
        {{ linkLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOwnerAvatar } from '@/utils/avatar'
import {
  getOwnerName,
  OrganizationLogo,
  OrganizationNameWithCertificate,
  Placeholder,
  type OrganizationReference,
  type UserReference
} from '@datagouv/components-next'

interface Props {
  title: string
  organization?: OrganizationReference | null
  owner?: UserReference | null
  accessType?: string
  linkLabel: string
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const props = withDefaults(defineProps<Props>(), {
  organization: undefined,
  owner: undefined,
  accessType: undefined,
  titleTag: 'h4'
})

const ownerName = computed(() => {
  if (!props.owner) return ''
  return getOwnerName({ organization: null, owner: props.owner })
})

const ownerAvatarUrl = computed(() => {
  if (!props.owner) return null
  return getOwnerAvatar({ organization: null, owner: props.owner }, 40)
})
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.owner-avatar {
  background-color: var(--background-default-grey);
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

.absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}
</style>

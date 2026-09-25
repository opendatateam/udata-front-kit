<script setup lang="ts">
import { Tooltip } from '@datagouv/components-next'

import VIconDsfr from '@/components/VIconDsfr.vue'

withDefaults(
  defineProps<{
    publicService?: boolean
    certified?: boolean
    // matches OrganizationNameWithCertificate's tooltip wording/component, for a consistent tick everywhere
    certifiedBy?: string
  }>(),
  { certifiedBy: 'data.gouv.fr' }
)
</script>

<template>
  <VIconDsfr
    v-if="publicService"
    name="bank-line"
    class="fr-icon--sm fr-mr-1v badge badge--public-service"
  />
  <slot />
  <Tooltip v-if="certified" class="inline-block">
    <VIconDsfr
      name="checkbox-circle-line"
      class="fr-icon--sm fr-ml-1v badge badge--certified"
    />
    <template #tooltip>
      <p class="fr-text--sm fr-mb-0">
        L'identité de ce service public est certifiée par {{ certifiedBy }}
      </p>
    </template>
  </Tooltip>
</template>

<style scoped>
.badge {
  color: var(--text-active-blue-france);
}

/* match OrganizationNameWithCertificate's owner-type/certified icon proportions (14px/20px) */
.badge--public-service::before,
.badge--public-service::after {
  --icon-size: 0.875rem;
}

.badge--certified::before,
.badge--certified::after {
  --icon-size: 1.25rem;
}
</style>

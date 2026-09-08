<script setup lang="ts">
import VIconDsfr from '@/components/VIconDsfr.vue'

defineProps<{
  publicService?: boolean
  certified?: boolean
}>()
</script>

<template>
  <VIconDsfr
    v-if="publicService"
    name="bank-line"
    class="fr-icon--sm fr-mr-1v badge badge--public-service"
  />
  <slot />
  <VIconDsfr
    v-if="certified"
    name="checkbox-circle-line"
    class="fr-icon--sm fr-mr-1v badge badge--certified"
  />
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

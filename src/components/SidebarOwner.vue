<script setup lang="ts">
import type { Owned } from '@datagouv/components-next'
import { OrganizationNameWithCertificate } from '@datagouv/components-next'
import { useRouter } from 'vue-router'

import OrganizationLogo from '@/components/OrganizationLogo.vue'
import { getOwnerAvatar } from '@/utils/avatar'

const props = defineProps<{ object: Owned }>()

const router = useRouter()
const organizationUrl = computed(() =>
  props.object.organization && router.hasRoute('organization_detail')
    ? {
        name: 'organization_detail',
        params: { oid: props.object.organization.id }
      }
    : undefined
)
</script>

<template>
  <div v-if="object.organization" class="fr-grid-row fr-grid-row--middle">
    <OrganizationLogo :object="object" class="fr-mr-1-5v" />
    <p class="fr-col fr-m-0 min-width-0">
      <RouterLink v-if="organizationUrl" class="fr-link" :to="organizationUrl">
        <OrganizationNameWithCertificate :organization="object.organization" />
      </RouterLink>
      <a v-else class="fr-link" :href="object.organization.page">
        <OrganizationNameWithCertificate :organization="object.organization" />
      </a>
    </p>
  </div>
  <div v-else-if="object.owner" class="fr-grid-row fr-grid-row--middle">
    <div class="owner-logo fr-mr-1-5v">
      <img
        :src="getOwnerAvatar(object)"
        alt=""
        loading="lazy"
        height="32"
        width="32"
        class="owner-avatar"
      />
    </div>
    <p class="fr-col fr-m-0 min-width-0">
      {{ object.owner.first_name }} {{ object.owner.last_name }}
    </p>
  </div>
</template>

<style scoped>
.owner-logo {
  display: inline-block;
  padding: 6px;
  border: 1px solid var(--border-default-grey);
  background: white;
}
.owner-avatar {
  margin-bottom: -6px;
}
</style>

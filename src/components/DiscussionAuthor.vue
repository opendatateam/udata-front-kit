<script setup lang="ts">
import type {
  OrganizationReference,
  UserReference
} from '@datagouv/components-next'
import { useRouter } from 'vue-router'

import OrganizationLogo from '@/components/OrganizationLogo.vue'
import { getOwnerAvatar } from '@/utils/avatar'

const props = defineProps<{
  owner: UserReference | null
  organization: OrganizationReference | null
}>()

const router = useRouter()
const organizationUrl = computed(() =>
  props.organization && router.hasRoute('organization_detail')
    ? {
        name: 'organization_detail',
        params: { oid: props.organization.id }
      }
    : undefined
)
</script>

<template>
  <span v-if="organization" class="discussion-author">
    <OrganizationLogo :object="{ organization }" :size="16" :padding="2" />
    <RouterLink
      v-if="organizationUrl"
      class="user-name user-link"
      :to="organizationUrl"
    >
      {{ organization.name }}
    </RouterLink>
    <a v-else class="user-name user-link" :href="organization.page">
      {{ organization.name }}
    </a>
  </span>
  <span v-else-if="owner" class="discussion-author">
    <div class="avatar">
      <img
        :src="getOwnerAvatar({ owner, organization: null }, 20)"
        alt=""
        loading="lazy"
        width="20"
        height="20"
      />
    </div>
    <p class="user-name">{{ owner.first_name }} {{ owner.last_name }}</p>
  </span>
</template>

<style scoped>
.discussion-author {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
}
.avatar {
  display: flex;
  align-items: center;
}
.avatar > img {
  border-radius: 50%;
}
.user-name {
  margin: 0;
  font-size: 0.75rem;
}
.user-link {
  color: var(--text-action-high-blue-france);
}
</style>

<script setup lang="ts">
import { useContactPointStore } from '@/store/ContactPointStore'
import type { ContactPoint } from '@datagouv/components-next'
import { storeToRefs } from 'pinia'

const store = useContactPointStore()
const { roles } = storeToRefs(store)

defineProps({
  contactPoints: {
    type: Object as PropType<ContactPoint[]>,
    required: true
  }
})

const getRoleLabel = (roleId: string) => {
  const role = roles.value.find((role) => role.id === roleId)
  return role ? role.label : roleId
}

const getLink = (contactPoint: ContactPoint) => {
  if (contactPoint.email) {
    return `mailto:${contactPoint.email}`
  } else if (contactPoint.contact_form) {
    return contactPoint.contact_form
  }
  return '#'
}

onMounted(() => {
  store.loadRoles()
})
</script>

<template>
  <p
    v-for="contactPoint in contactPoints"
    :key="contactPoint.id"
    class="fr-text--sm fr-mt-0 fr-mb-1w fr-grid-row no-wrap fr-grid-row--middle"
  >
    <a
      :href="getLink(contactPoint)"
      rel="ugc nofollow noopener"
      target="_blank"
      class="fr-text--sm fr-link text-grey-500 text-overflow-ellipsis overflow-hidden"
    >
      {{ contactPoint.name || contactPoint.email || contactPoint.contact_form }}
    </a>
    <small class="fr-ml-1w fr-text--xs fr-m-0 text-grey-380 f-italic"
      >({{ getRoleLabel(contactPoint.role) }})</small
    >
  </p>
</template>

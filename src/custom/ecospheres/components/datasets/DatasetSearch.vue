<script setup lang="ts">
import config from '@/config'
import { useOrganizationStore } from '@/store/OrganizationStore'

const hasOrganizationFilter = config.website.datasets
  .organization_filter as boolean

const organizationOptions = computed(() => [
  { value: '', text: 'Toutes les organisations' },
  ...useOrganizationStore().flatData.map((org) => {
    return { value: org.id, text: org.name }
  })
])

const onSelectOrganization = (orgId: string | number) => {
  router.push({
    path: '/datasets',
    query: computeUrlQuery({
      page: 1,
      organization: orgId
    })
  })
}

onMounted(() => {
  if (hasOrganizationFilter) {
    useOrganizationStore().loadFromConfigFlat()
  }
})
</script>

<template>TODO</template>

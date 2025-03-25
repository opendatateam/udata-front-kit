<script setup lang="ts">
import { useOrganizationStore } from '@/store/OrganizationStore'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const selectedOrganization: Ref<string | null> = ref(null)

const organizationOptions = computed(() => [
  ...useOrganizationStore().flatData.map((org) => {
    return { id: org.id, name: org.name }
  })
])

const onSelectOrganization = (orgId: string | null) => {
  router.push({
    path: '/datasets',
    query: {
      ...route.query,
      page: 1,
      organization: orgId
    },
    hash: '#datasets-list'
  })
}

onMounted(() => {
  useOrganizationStore().loadFromConfigFlat()
})

watch(
  () => route.query.organization,
  (newValue) => {
    selectedOrganization.value = newValue as string
  },
  { immediate: true }
)
</script>

<template>
  <div className="filterForm">
    <div class="fr-select-group">
      <SelectComponent
        default-option="Toutes les organisations"
        label="Organisation"
        :options="organizationOptions"
        :model-value="selectedOrganization"
        @update:model-value="onSelectOrganization"
      />
    </div>
  </div>
</template>

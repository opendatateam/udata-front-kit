<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useUserStore } from '@/store/UserStore'

const props = defineProps<{ id: string }>()
const organizationId = defineModel<string | null>({ default: null })

const userStore = useUserStore()
const { data, userName } = storeToRefs(userStore)
const organizations = computed(() => data.value?.organizations ?? [])

// sentinel avoiding collision with DsfrSelect's own placeholder option (value "")
const SELF = 'self'

const options = computed(() => [
  ...organizations.value.map((org) => ({ value: org.id, text: org.name })),
  { value: SELF, text: userName.value ?? '' }
])

// left unselected (placeholder shown) until the user explicitly picks an identity
const selected = ref<string>()
watch(selected, (value) => {
  organizationId.value = !value || value === SELF ? null : value
})
</script>

<template>
  <DsfrSelect
    v-if="organizations.length"
    :id="`discussion-identity-${props.id}`"
    v-model="selected"
    label="Choisissez l'identité avec laquelle vous souhaitez publier ce message"
    required
    :options="options"
  />
</template>

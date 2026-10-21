<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

import { useUserStore } from '@/store/UserStore'

// null means posting as yourself
const organizationId = defineModel<string | null>({ default: null })

const { data, userName } = storeToRefs(useUserStore())
const organizations = computed(() => data.value?.organizations ?? [])

// Yourself comes last, identified by your user id
const options = computed(() => [
  ...organizations.value.map((org) => ({ value: org.id, text: org.name })),
  ...(data.value ? [{ value: data.value.id, text: userName.value ?? '' }] : [])
])

// Starts unselected so the user has to pick an identity explicitly
const selection = ref<string>()
watch(selection, (value) => {
  organizationId.value = !value || value === data.value?.id ? null : value
})
</script>

<template>
  <DsfrSelect
    v-if="organizations.length"
    v-model="selection"
    required
    :options="options"
    label="Choisissez l'identité avec laquelle vous souhaitez publier ce message"
  />
</template>

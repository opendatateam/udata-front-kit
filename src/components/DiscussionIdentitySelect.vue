<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import SelectComponent from '@/components/SelectComponent.vue'
import { useUserStore } from '@/store/UserStore'

const organizationId = defineModel<string | null>({ default: null })

const { data, userName } = storeToRefs(useUserStore())
const organizations = computed(() => data.value?.organizations ?? [])

const options = computed(() =>
  organizations.value.map((org) => ({ id: org.id, name: org.name }))
)
</script>

<template>
  <SelectComponent
    v-if="organizations.length"
    v-model="organizationId"
    required
    :default-option="userName ?? null"
    :options="options"
    label="Choisissez l'identité avec laquelle vous souhaitez publier ce message"
  />
</template>

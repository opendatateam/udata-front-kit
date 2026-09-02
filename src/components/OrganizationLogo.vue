<script setup lang="ts">
import type { OrganizationReference } from '@datagouv/components-next'
import { computed } from 'vue'

import LogoBox from '@/components/LogoBox.vue'
import config from '@/config'

const props = withDefaults(
  defineProps<{
    object: { organization?: OrganizationReference | null }
    size?: number
    padding?: number
  }>(),
  { size: 32, padding: 6 }
)

const logoSrc = computed(
  () =>
    props.object.organization?.logo_thumbnail ||
    `${config.datagouvfr.base_url}/_themes/gouvfr/img/placeholders/organization.png`
)
</script>

<template>
  <LogoBox :src="logoSrc" :size="size" :padding="padding" />
</template>

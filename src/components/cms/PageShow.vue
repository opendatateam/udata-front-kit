<script lang="ts" setup>
import type { PageBloc } from '@datagouv/components-next'

import BlocList from './BlocList.vue'

defineProps<{
  edit: boolean
}>()

const blocs = defineModel<PageBloc[]>('blocs', { required: true })
</script>

<template>
  <BlocList v-model:blocs="blocs" :edit="edit" />
</template>

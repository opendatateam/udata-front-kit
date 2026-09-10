<script lang="ts" setup>
import type { PageBloc } from '@datagouv/components-next'

import BlocList from './BlocList.vue'

const props = defineProps<{
  blocs: PageBloc[]
  edit: boolean
}>()

const emit = defineEmits<{
  save: [blocs: PageBloc[]]
}>()

const localBlocs = ref<PageBloc[]>([...props.blocs])

watch(
  () => props.blocs,
  (newBlocs) => {
    localBlocs.value = [...newBlocs]
  }
)

const save = () => {
  emit('save', localBlocs.value)
}
</script>

<template>
  <div>
    <BlocList v-model:blocs="localBlocs" :edit="edit" />

    <div v-if="edit" class="fr-container fr-py-2w">
      <button
        type="button"
        class="fr-btn fr-icon-save-line fr-btn--icon-left"
        @click="save"
      >
        Enregistrer
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PageBloc } from '@datagouv/components-next'

import AddBlocDropdown from './AddBlocDropdown.vue'

defineProps<{
  index: number
  total: number
  allowed?: PageBloc['class'][]
}>()

const emit = defineEmits<{
  'move-up': [index: number]
  'move-down': [index: number]
  remove: [index: number]
  add: [bloc: PageBloc, afterIndex: number]
}>()
</script>

<template>
  <div class="fr-btns-group fr-btns-group--inline">
    <button
      type="button"
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-up-line"
      :disabled="index === 0"
      title="Déplacer vers le haut"
      @click="emit('move-up', index)"
    />
    <button
      type="button"
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-down-line"
      :disabled="index === total - 1"
      title="Déplacer vers le bas"
      @click="emit('move-down', index)"
    />
    <button
      type="button"
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line"
      title="Supprimer"
      @click="emit('remove', index)"
    />
  </div>
  <AddBlocDropdown :allowed="allowed" @add="emit('add', $event, index)" />
</template>

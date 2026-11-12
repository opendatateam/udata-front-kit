<script setup lang="ts">
defineProps({
  permissions: {
    type: Object as () => { edit: boolean; delete: boolean },
    required: true
  },
  // e.g. "la discussion", "le commentaire"
  itemLabel: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div
    v-if="permissions.edit || permissions.delete"
    class="discussion-item-actions"
  >
    <DsfrButton
      v-if="permissions.edit"
      size="sm"
      tertiary
      icon-only
      type="button"
      icon="fr-icon-edit-line"
      :label="`Modifier ${itemLabel}`"
      @click="emit('edit')"
    />
    <DsfrButton
      v-if="permissions.delete"
      size="sm"
      tertiary
      icon-only
      type="button"
      icon="fr-icon-delete-line"
      :label="`Supprimer ${itemLabel}`"
      @click="emit('delete')"
    />
  </div>
</template>

<style scoped>
.discussion-item-actions {
  display: flex;
  flex: 0 0 auto;
  column-gap: 0.25rem;
}
</style>

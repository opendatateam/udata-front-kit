<script setup lang="ts">
import DiscussionIdentitySelect from '@/components/DiscussionIdentitySelect.vue'

defineProps({
  idPrefix: {
    type: String,
    required: true
  },
  submitLabel: {
    type: String,
    required: true
  },
  withTitle: {
    type: Boolean,
    default: false
  },
  withIdentity: {
    type: Boolean,
    default: false
  }
})

const title = defineModel<string>('title', { default: '' })
const comment = defineModel<string>('comment', { default: '' })
// null means posting as yourself
const organization = defineModel<string | null>('organization', {
  default: null
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()
</script>

<template>
  <form @submit.prevent="emit('submit')">
    <DiscussionIdentitySelect v-if="withIdentity" v-model="organization" />
    <div v-if="withTitle" class="fr-input-group">
      <label class="fr-label" :for="`${idPrefix}-title`">
        Titre (obligatoire)
      </label>
      <input
        :id="`${idPrefix}-title`"
        v-model="title"
        required
        class="fr-input"
        name="title"
      />
    </div>
    <div class="fr-input-group">
      <label class="fr-label" :for="`${idPrefix}-message`">
        Votre message (obligatoire)
      </label>
      <textarea
        :id="`${idPrefix}-message`"
        v-model="comment"
        required
        class="fr-input"
        name="message"
      ></textarea>
    </div>
    <div class="align-right">
      <DsfrButton
        size="sm"
        tertiary
        type="button"
        label="Annuler"
        class="fr-mr-1w"
        @click="emit('cancel')"
      />
      <slot name="actions" />
      <DsfrButton size="sm" type="submit" :label="submitLabel" />
    </div>
  </form>
</template>

<style scoped>
/* An icon-left button sits on a different text baseline than a plain one, misaligning the row. */
.align-right :deep(.fr-btn) {
  vertical-align: middle;
}
</style>

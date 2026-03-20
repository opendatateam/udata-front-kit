<script lang="ts" setup>
import type { MarkdownBloc } from '@datagouv/components-next'

import { fromMarkdown } from '@/utils'

const props = defineProps<{
  modelValue: MarkdownBloc
  edit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MarkdownBloc]
}>()

const renderedContent = computed(() => fromMarkdown(props.modelValue.content))

const update = (patch: Partial<MarkdownBloc>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}
</script>

<template>
  <div v-if="!edit">
    <h2 v-if="modelValue.title" class="fr-h3">{{ modelValue.title }}</h2>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="fr-prose" v-html="renderedContent" />
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label :for="`markdown-title-${modelValue.id}`" class="fr-label"
        >Titre</label
      >
      <input
        :id="`markdown-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title"
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <div>
      <label :for="`markdown-content-${modelValue.id}`" class="fr-label">
        Contenu (Markdown)
      </label>
      <textarea
        :id="`markdown-content-${modelValue.id}`"
        class="fr-input"
        rows="10"
        :value="modelValue.content"
        @input="
          update({ content: ($event.target as HTMLTextAreaElement).value })
        "
      />
    </div>
  </div>
</template>

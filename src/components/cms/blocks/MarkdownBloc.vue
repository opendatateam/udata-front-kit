<script lang="ts" setup>
import type { MarkdownBloc } from '@datagouv/components-next'

import { fromMarkdown } from '@/utils'

const props = defineProps<{
  modelValue: MarkdownBloc
  edit: boolean
  // true when rendered inside an accordion section (its own title is an h3),
  // so this bloc's title must step down to h4 to keep the heading order valid
  nested?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MarkdownBloc]
}>()

const renderedContent = computed(
  () => fromMarkdown(props.modelValue.content).html
)

const update = (patch: Partial<MarkdownBloc>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}
</script>

<template>
  <div v-if="!edit">
    <component :is="nested ? 'h4' : 'h2'" v-if="modelValue.title" class="fr-h3">
      {{ modelValue.title }}
    </component>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="fr-prose" v-html="renderedContent" />
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label :for="`markdown-title-${modelValue.id}`" class="fr-label"
        >Titre (obligatoire)</label
      >
      <input
        :id="`markdown-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title"
        required
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <div>
      <label :for="`markdown-content-${modelValue.id}`" class="fr-label">
        Contenu (Markdown, obligatoire)
      </label>
      <textarea
        :id="`markdown-content-${modelValue.id}`"
        class="fr-input"
        rows="10"
        :value="modelValue.content"
        required
        @input="
          update({ content: ($event.target as HTMLTextAreaElement).value })
        "
      />
    </div>
  </div>
</template>

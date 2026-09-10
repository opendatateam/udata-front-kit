<script lang="ts" setup>
import type {
  AccordionItemBloc,
  AccordionListBloc,
  ContentBloc,
  PageBloc
} from '@datagouv/components-next'

import BlocList from '../BlocList.vue'

const props = defineProps<{
  modelValue: AccordionListBloc
  edit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AccordionListBloc]
}>()

// Accordion sections can only hold content blocs, not another Hero or Accordion.
const ALLOWED_ITEM_CLASSES: PageBloc['class'][] = [
  'DatasetsListBloc',
  'DataservicesListBloc',
  'ReusesListBloc',
  'LinksListBloc',
  'MarkdownBloc'
]

// -1 means no section open; DsfrAccordionsGroup keeps only one open at a time.
const activeItemIndex = ref(-1)

const update = (patch: Partial<AccordionListBloc>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

const addItem = () => {
  const item: AccordionItemBloc = { title: 'Nouvelle section', content: [] }
  update({ items: [...props.modelValue.items, item] })
}

const removeItem = (index: number) => {
  update({ items: props.modelValue.items.filter((_, i) => i !== index) })
}

const updateItemTitle = (index: number, title: string) => {
  update({
    items: props.modelValue.items.map((item, i) =>
      i === index ? { ...item, title } : item
    )
  })
}

const updateItemContent = (index: number, content: ContentBloc[]) => {
  update({
    items: props.modelValue.items.map((item, i) =>
      i === index ? { ...item, content } : item
    )
  })
}
</script>

<template>
  <div v-if="!edit">
    <h2 v-if="modelValue.title" class="fr-h3">{{ modelValue.title }}</h2>
    <p v-if="modelValue.description">{{ modelValue.description }}</p>
    <DsfrAccordionsGroup v-model="activeItemIndex">
      <DsfrAccordion
        v-for="(item, index) in modelValue.items"
        :key="index"
        :title="item.title"
        title-tag="h3"
      >
        <BlocList :blocs="item.content" :edit="false" nested />
      </DsfrAccordion>
    </DsfrAccordionsGroup>
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label :for="`accordion-title-${modelValue.id}`" class="fr-label"
        >Titre</label
      >
      <input
        :id="`accordion-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title ?? ''"
        @input="
          update({ title: ($event.target as HTMLInputElement).value || null })
        "
      />
    </div>
    <div class="fr-mb-3w">
      <label :for="`accordion-description-${modelValue.id}`" class="fr-label"
        >Description</label
      >
      <textarea
        :id="`accordion-description-${modelValue.id}`"
        class="fr-input"
        rows="2"
        :value="modelValue.description ?? ''"
        @input="
          update({
            description: ($event.target as HTMLTextAreaElement).value || null
          })
        "
      />
    </div>

    <div
      v-for="(item, index) in modelValue.items"
      :key="index"
      class="fr-mb-3w fr-p-2w"
      style="border: 1px solid var(--border-default-grey)"
    >
      <div
        class="fr-grid-row fr-grid-row--middle fr-grid-row--space-between fr-mb-1w"
      >
        <input
          type="text"
          class="fr-input"
          style="max-width: 60%"
          :value="item.title"
          @input="
            updateItemTitle(index, ($event.target as HTMLInputElement).value)
          "
        />
        <button
          type="button"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line"
          title="Supprimer la section"
          @click="removeItem(index)"
        />
      </div>
      <BlocList
        :blocs="item.content"
        :edit="true"
        nested
        :allowed="ALLOWED_ITEM_CLASSES"
        @update:blocs="updateItemContent(index, $event as ContentBloc[])"
      />
    </div>

    <button
      type="button"
      class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-add-circle-line fr-btn--icon-left"
      @click="addItem"
    >
      Ajouter une section
    </button>
  </div>
</template>

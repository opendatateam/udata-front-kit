<script lang="ts" setup>
import type { LinkInBloc, LinksListBloc } from '@datagouv/components-next'

const props = defineProps<{
  modelValue: LinksListBloc
  edit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LinksListBloc]
}>()

const update = (patch: Partial<LinksListBloc>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

const updateLink = (index: number, patch: Partial<LinkInBloc>) => {
  update({
    links: props.modelValue.links.map((link, i) =>
      i === index ? { ...link, ...patch } : link
    )
  })
}

const removeLink = (index: number) => {
  update({ links: props.modelValue.links.filter((_, i) => i !== index) })
}

const addLink = () => {
  const link: LinkInBloc = { title: '', url: '', color: null }
  update({ links: [...props.modelValue.links, link] })
}
</script>

<template>
  <div v-if="!edit">
    <h2 v-if="modelValue.title" class="fr-h3">{{ modelValue.title }}</h2>
    <p v-if="modelValue.subtitle" class="fr-text--lead">
      {{ modelValue.subtitle }}
    </p>
    <p v-if="modelValue.paragraph">{{ modelValue.paragraph }}</p>
    <ul
      v-if="modelValue.links.length"
      class="fr-btns-group fr-btns-group--inline-md"
    >
      <li v-for="(link, index) in modelValue.links" :key="index">
        <a
          :href="link.url"
          class="fr-btn fr-btn--secondary"
          :style="
            link.color
              ? `border-color: ${link.color}; color: ${link.color}`
              : ''
          "
        >
          {{ link.title }}
        </a>
      </li>
    </ul>
    <a
      v-if="modelValue.main_link_url"
      :href="modelValue.main_link_url"
      class="fr-btn fr-mt-2w"
    >
      {{ modelValue.main_link_title || 'En savoir plus' }}
    </a>
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label :for="`links-title-${modelValue.id}`" class="fr-label"
        >Titre</label
      >
      <input
        :id="`links-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title"
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <div class="fr-mb-2w">
      <label :for="`links-subtitle-${modelValue.id}`" class="fr-label"
        >Sous-titre</label
      >
      <input
        :id="`links-subtitle-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.subtitle ?? ''"
        @input="
          update({
            subtitle: ($event.target as HTMLInputElement).value || null
          })
        "
      />
    </div>
    <div class="fr-mb-2w">
      <label :for="`links-paragraph-${modelValue.id}`" class="fr-label"
        >Paragraphe</label
      >
      <textarea
        :id="`links-paragraph-${modelValue.id}`"
        class="fr-input"
        rows="2"
        :value="modelValue.paragraph ?? ''"
        @input="
          update({
            paragraph: ($event.target as HTMLTextAreaElement).value || null
          })
        "
      />
    </div>

    <div class="fr-grid-row fr-grid-row--gutters fr-mb-2w">
      <div class="fr-col-6">
        <label :for="`links-main-title-${modelValue.id}`" class="fr-label">
          Titre du lien principal (optionnel)
        </label>
        <input
          :id="`links-main-title-${modelValue.id}`"
          type="text"
          class="fr-input"
          :value="modelValue.main_link_title ?? ''"
          @input="
            update({
              main_link_title: ($event.target as HTMLInputElement).value || null
            })
          "
        />
      </div>
      <div class="fr-col-6">
        <label :for="`links-main-url-${modelValue.id}`" class="fr-label">
          URL du lien principal (optionnel)
        </label>
        <input
          :id="`links-main-url-${modelValue.id}`"
          type="url"
          class="fr-input"
          :value="modelValue.main_link_url ?? ''"
          @input="
            update({
              main_link_url: ($event.target as HTMLInputElement).value || null
            })
          "
        />
      </div>
    </div>

    <p class="fr-label fr-mb-1w">Liens</p>
    <div
      v-for="(link, index) in modelValue.links"
      :key="index"
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--bottom fr-mb-1w"
    >
      <div class="fr-col-4">
        <label
          :for="`links-link-title-${modelValue.id}-${index}`"
          class="fr-label"
          >Titre</label
        >
        <input
          :id="`links-link-title-${modelValue.id}-${index}`"
          type="text"
          class="fr-input"
          :value="link.title"
          @input="
            updateLink(index, {
              title: ($event.target as HTMLInputElement).value
            })
          "
        />
      </div>
      <div class="fr-col-4">
        <label
          :for="`links-link-url-${modelValue.id}-${index}`"
          class="fr-label"
          >URL</label
        >
        <input
          :id="`links-link-url-${modelValue.id}-${index}`"
          type="url"
          class="fr-input"
          :value="link.url"
          @input="
            updateLink(index, {
              url: ($event.target as HTMLInputElement).value
            })
          "
        />
      </div>
      <div class="fr-col-3">
        <label
          :for="`links-link-color-${modelValue.id}-${index}`"
          class="fr-label"
          >Couleur (optionnel)</label
        >
        <input
          :id="`links-link-color-${modelValue.id}-${index}`"
          type="text"
          class="fr-input"
          :value="link.color ?? ''"
          @input="
            updateLink(index, {
              color: ($event.target as HTMLInputElement).value || null
            })
          "
        />
      </div>
      <div class="fr-col-1">
        <button
          type="button"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-only fr-icon-delete-line"
          title="Supprimer le lien"
          @click="removeLink(index)"
        />
      </div>
    </div>

    <button
      type="button"
      class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-add-circle-line fr-btn--icon-left"
      @click="addLink"
    >
      Ajouter un lien
    </button>
  </div>
</template>

<script lang="ts" setup>
import type {
  DatasetsListBloc,
  HeroBloc,
  MarkdownBloc,
  PageBloc
} from '@datagouv/components-next'

const emit = defineEmits<{
  add: [bloc: PageBloc]
}>()

const isOpen = ref(false)

const createHeroBloc = (): HeroBloc => ({
  id: crypto.randomUUID(),
  class: 'HeroBloc',
  title: 'Titre du bandeau',
  description: null,
  color: 'primary',
  main_link_title: null,
  main_link_url: null
})

const createMarkdownBloc = (): MarkdownBloc => ({
  id: crypto.randomUUID(),
  class: 'MarkdownBloc',
  title: '',
  subtitle: null,
  content: ''
})

const createDatasetsListBloc = (): DatasetsListBloc => ({
  id: crypto.randomUUID(),
  class: 'DatasetsListBloc',
  title: 'Jeux de données',
  subtitle: null,
  datasets: []
})

const addBloc = (factory: () => PageBloc) => {
  emit('add', factory())
  isOpen.value = false
}
</script>

<template>
  <div class="fr-my-2w" style="position: relative; display: inline-block">
    <button
      type="button"
      class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-add-circle-line fr-btn--icon-left"
      @click="isOpen = !isOpen"
    >
      Ajouter un bloc
    </button>
    <ul
      v-if="isOpen"
      class="fr-menu__list"
      style="
        position: absolute;
        z-index: 100;
        background: white;
        border: 1px solid var(--border-default-grey);
        list-style: none;
        padding: 0;
        margin: 0;
        min-width: 180px;
      "
    >
      <li>
        <button
          type="button"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
          style="width: 100%; text-align: left"
          @click="addBloc(createHeroBloc)"
        >
          Bandeau héro
        </button>
      </li>
      <li>
        <button
          type="button"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
          style="width: 100%; text-align: left"
          @click="addBloc(createMarkdownBloc)"
        >
          Contenu Markdown
        </button>
      </li>
      <li>
        <button
          type="button"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
          style="width: 100%; text-align: left"
          @click="addBloc(createDatasetsListBloc)"
        >
          Liste de jeux de données
        </button>
      </li>
    </ul>
  </div>
</template>

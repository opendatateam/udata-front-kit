<script lang="ts" setup>
import type {
  AccordionListBloc,
  DataservicesListBloc,
  DatasetsListBloc,
  HeroBloc,
  LinksListBloc,
  MarkdownBloc,
  PageBloc,
  ReusesListBloc
} from '@datagouv/components-next'
import { useRandomId } from '@gouvminint/vue-dsfr'

const props = defineProps<{
  // Restricts which bloc types can be added here (e.g. accordion sections can't nest Hero/Accordion blocs).
  allowed?: PageBloc['class'][]
}>()

const emit = defineEmits<{
  add: [bloc: PageBloc]
}>()

const menuId = useRandomId('add-bloc-menu')
const root = ref<HTMLElement>()
const isOpen = ref(false)

const close = () => {
  isOpen.value = false
}

// matches DsfrLanguageSelector's own toggle-menu pattern, which doesn't
// close on Escape/outside click either — nothing upstream covers that part
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}
const onClickOutside = (event: MouseEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('click', onClickOutside)
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('click', onClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside)
})

const createHeroBloc = (): HeroBloc => ({
  id: crypto.randomUUID(),
  class: 'HeroBloc',
  title: '',
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
  title: '',
  subtitle: null,
  datasets: []
})

const createDataservicesListBloc = (): DataservicesListBloc => ({
  id: crypto.randomUUID(),
  class: 'DataservicesListBloc',
  title: '',
  subtitle: null,
  dataservices: []
})

const createReusesListBloc = (): ReusesListBloc => ({
  id: crypto.randomUUID(),
  class: 'ReusesListBloc',
  title: '',
  subtitle: null,
  reuses: []
})

const createLinksListBloc = (): LinksListBloc => ({
  id: crypto.randomUUID(),
  class: 'LinksListBloc',
  title: '',
  subtitle: null,
  paragraph: null,
  main_link_title: null,
  main_link_url: null,
  links: []
})

const createAccordionListBloc = (): AccordionListBloc => ({
  id: crypto.randomUUID(),
  class: 'AccordionListBloc',
  title: null,
  description: null,
  items: []
})

const menuItems: Array<{
  class: PageBloc['class']
  label: string
  factory: () => PageBloc
}> = [
  { class: 'HeroBloc', label: 'Bandeau héro', factory: createHeroBloc },
  {
    class: 'MarkdownBloc',
    label: 'Contenu Markdown',
    factory: createMarkdownBloc
  },
  {
    class: 'DatasetsListBloc',
    label: 'Liste de jeux de données',
    factory: createDatasetsListBloc
  },
  {
    class: 'DataservicesListBloc',
    label: 'Liste d’API',
    factory: createDataservicesListBloc
  },
  {
    class: 'ReusesListBloc',
    label: 'Liste de réutilisations',
    factory: createReusesListBloc
  },
  {
    class: 'LinksListBloc',
    label: 'Liste de liens',
    factory: createLinksListBloc
  },
  {
    class: 'AccordionListBloc',
    label: 'Accordéon',
    factory: createAccordionListBloc
  }
]

const visibleMenuItems = computed(() =>
  props.allowed
    ? menuItems.filter((item) => props.allowed?.includes(item.class))
    : menuItems
)

const addBloc = (factory: () => PageBloc) => {
  emit('add', factory())
  isOpen.value = false
}
</script>

<template>
  <div
    ref="root"
    class="fr-my-2w"
    style="position: relative; display: inline-block"
  >
    <button
      type="button"
      class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-add-circle-line fr-btn--icon-left"
      :aria-expanded="isOpen"
      :aria-controls="menuId"
      aria-haspopup="true"
      @click="isOpen = !isOpen"
    >
      Ajouter un bloc
    </button>
    <ul
      v-if="isOpen"
      :id="menuId"
      role="menu"
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
      <li v-for="item in visibleMenuItems" :key="item.class" role="none">
        <button
          type="button"
          role="menuitem"
          class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
          style="width: 100%; text-align: left"
          @click="addBloc(item.factory)"
        >
          {{ item.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { Reuse, ReusesListBloc } from '@datagouv/components-next'
import { ReuseCard } from '@datagouv/components-next'

import ReusesAPI from '@/services/api/resources/ReusesAPI'

const props = defineProps<{
  modelValue: ReusesListBloc
  edit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ReusesListBloc]
}>()

const reusesAPI = new ReusesAPI()
const searchQuery = ref('')
const searchResults = ref<Reuse[]>([])
const searchLoading = ref(false)

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const onSearchInput = (e: Event) => {
  const q = (e.target as HTMLInputElement).value
  searchQuery.value = q
  if (searchDebounce) clearTimeout(searchDebounce)
  if (!q) {
    searchResults.value = []
    return
  }
  searchDebounce = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await reusesAPI.list({ params: { q, page_size: 5 } })
      searchResults.value = res.data ?? []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

const addReuse = (reuse: Reuse) => {
  if (props.modelValue.reuses.some((r) => r.id === reuse.id)) return
  emit('update:modelValue', {
    ...props.modelValue,
    reuses: [...props.modelValue.reuses, reuse]
  })
  searchQuery.value = ''
  searchResults.value = []
}

const removeReuse = (reuseId: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    reuses: props.modelValue.reuses.filter((r) => r.id !== reuseId)
  })
}

const update = (patch: Partial<ReusesListBloc>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}
</script>

<template>
  <div v-if="!edit">
    <h2 v-if="modelValue.title" class="fr-h3 fr-mb-2w">
      {{ modelValue.title }}
    </h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="reuse in modelValue.reuses"
        :key="reuse.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4"
      >
        <ReuseCard :reuse="reuse" :reuse-url="reuse.page" />
      </div>
    </div>
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label :for="`reuses-title-${modelValue.id}`" class="fr-label">
        Titre <span class="fr-hint-text">Obligatoire</span>
      </label>
      <input
        :id="`reuses-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title"
        required
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <div class="fr-mb-2w">
      <p class="fr-label fr-mb-1w">Réutilisations sélectionnées</p>
      <ul v-if="modelValue.reuses.length" class="fr-tags-group">
        <li v-for="reuse in modelValue.reuses" :key="reuse.id">
          <button
            type="button"
            class="fr-tag fr-tag--dismiss"
            @click="removeReuse(reuse.id)"
          >
            {{ reuse.title }}
          </button>
        </li>
      </ul>
      <p v-else class="fr-text--sm fr-text-mention--grey">
        Aucune réutilisation sélectionnée.
      </p>
    </div>

    <div class="fr-search-bar">
      <label :for="`reuses-search-${modelValue.id}`" class="fr-label">
        Ajouter une réutilisation
      </label>
      <input
        :id="`reuses-search-${modelValue.id}`"
        type="search"
        class="fr-input"
        placeholder="Rechercher..."
        :value="searchQuery"
        @input="onSearchInput"
      />
    </div>

    <ul
      v-if="searchResults.length"
      class="fr-mt-1w"
      style="list-style: none; padding: 0"
    >
      <li
        v-for="result in searchResults"
        :key="result.id"
        class="fr-py-1w fr-px-2w fr-background-default--grey"
        style="
          border-bottom: 1px solid var(--border-default-grey);
          cursor: pointer;
        "
        @click="addReuse(result)"
      >
        {{ result.title }}
      </li>
    </ul>
    <p v-if="searchLoading" class="fr-text--sm fr-mt-1w">Recherche en cours…</p>
  </div>
</template>

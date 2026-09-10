<script lang="ts" setup>
import type {
  Dataservice,
  DataservicesListBloc
} from '@datagouv/components-next'
import { DataserviceCard } from '@datagouv/components-next'

import DataservicesAPI from '@/services/api/resources/DataservicesAPI'

const props = defineProps<{
  modelValue: DataservicesListBloc
  edit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DataservicesListBloc]
}>()

const dataservicesAPI = new DataservicesAPI()
const searchQuery = ref('')
const searchResults = ref<Dataservice[]>([])
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
      const res = await dataservicesAPI.list({ params: { q, page_size: 5 } })
      searchResults.value = res.data ?? []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

const addDataservice = (dataservice: Dataservice) => {
  if (props.modelValue.dataservices.some((d) => d.id === dataservice.id)) return
  emit('update:modelValue', {
    ...props.modelValue,
    dataservices: [...props.modelValue.dataservices, dataservice]
  })
  searchQuery.value = ''
  searchResults.value = []
}

const removeDataservice = (dataserviceId: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    dataservices: props.modelValue.dataservices.filter(
      (d) => d.id !== dataserviceId
    )
  })
}

const update = (patch: Partial<DataservicesListBloc>) => {
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
        v-for="dataservice in modelValue.dataservices"
        :key="dataservice.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4"
      >
        <DataserviceCard :dataservice="dataservice" />
      </div>
    </div>
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label :for="`dataservices-title-${modelValue.id}`" class="fr-label">
        Titre <span class="fr-hint-text">Obligatoire</span>
      </label>
      <input
        :id="`dataservices-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title"
        required
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <div class="fr-mb-2w">
      <p class="fr-label fr-mb-1w">API sélectionnées</p>
      <ul v-if="modelValue.dataservices.length" class="fr-tags-group">
        <li
          v-for="dataservice in modelValue.dataservices"
          :key="dataservice.id"
        >
          <button
            type="button"
            class="fr-tag fr-tag--dismiss"
            @click="removeDataservice(dataservice.id)"
          >
            {{ dataservice.title }}
          </button>
        </li>
      </ul>
      <p v-else class="fr-text--sm fr-text-mention--grey">
        Aucune API sélectionnée.
      </p>
    </div>

    <div class="fr-search-bar">
      <label :for="`dataservices-search-${modelValue.id}`" class="fr-label">
        Ajouter une API
      </label>
      <input
        :id="`dataservices-search-${modelValue.id}`"
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
        @click="addDataservice(result)"
      >
        {{ result.title }}
      </li>
    </ul>
    <p v-if="searchLoading" class="fr-text--sm fr-mt-1w">Recherche en cours…</p>
  </div>
</template>

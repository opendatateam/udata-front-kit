<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import { ref } from 'vue'

import SearchAPI from '@/services/api/SearchAPI'

// Capped, not paginated: unlike addOrganizationDatasets() this is meant as
// a quick "grab the top N for this keyword" shortcut, not an exhaustive
// fetch — a tag can match thousands of unrelated datasets across
// data.gouv.fr, so adding everything would be both slow and imprecise.
const RESULT_CAP = 25

const props = defineProps<{
  pendingTag: string | null
}>()

const emit = defineEmits<{
  add: [
    payload: { tag: string; datasets: Array<{ id: string; title: string }> }
  ]
}>()

const query = ref('')
const results = ref<DatasetV2[]>([])
const total = ref(0)
const loading = ref(false)
const searched = ref(false)
const error = ref<string | null>(null)
const addedTags = ref(new Set<string>())

const search = async () => {
  const tag = query.value.trim()
  if (!tag) return
  loading.value = true
  error.value = null
  searched.value = true
  try {
    const response = await new SearchAPI().search('', {
      tag,
      page: 1,
      page_size: RESULT_CAP
    })
    results.value = response.data
    total.value = response.total
  } catch {
    error.value = 'Échec de la recherche.'
  } finally {
    loading.value = false
  }
}

const addAll = () => {
  const tag = query.value.trim()
  if (!tag || !results.value.length) return
  addedTags.value.add(tag)
  emit('add', {
    tag,
    datasets: results.value.map((dataset) => ({
      id: dataset.id,
      title: dataset.title
    }))
  })
}

const isPending = () => props.pendingTag === query.value.trim()
const isDone = () => addedTags.value.has(query.value.trim()) && !isPending()
</script>

<template>
  <div class="tag-search">
    <div class="fr-search-bar" role="search">
      <label class="fr-label" for="universe-tag-search"
        >Rechercher par mot-clé (tag data.gouv.fr)</label
      >
      <input
        id="universe-tag-search"
        v-model="query"
        class="fr-input"
        type="search"
        placeholder="Ex : velo"
        @keydown.enter.prevent="search"
      />
      <button type="button" class="fr-btn" title="Rechercher" @click="search">
        Rechercher
      </button>
    </div>

    <p v-if="loading" class="fr-text--sm fr-mt-2w">Recherche…</p>
    <DsfrAlert v-else-if="error" type="error" :title="error" class="fr-mt-2w" />
    <p
      v-else-if="searched && results.length === 0"
      class="fr-text--sm fr-mt-2w"
    >
      Aucun jeu de données trouvé pour ce mot-clé.
    </p>

    <div v-else-if="results.length" class="fr-mt-2w">
      <div
        class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-1w"
      >
        <div class="fr-col">
          <p class="fr-m-0 fr-text--sm">
            {{ results.length }} jeu{{ results.length > 1 ? 'x' : '' }} de
            données{{
              total > results.length
                ? ` sur ${total} au total (les ${RESULT_CAP} premiers)`
                : ''
            }}
          </p>
        </div>
        <div class="fr-col-auto">
          <button
            v-if="isDone()"
            type="button"
            class="fr-btn fr-icon-check-line fr-btn--icon-left"
            disabled
          >
            Ajouté
          </button>
          <button
            v-else
            type="button"
            class="fr-btn fr-btn--secondary fr-icon-add-line fr-btn--icon-left"
            :disabled="isPending()"
            @click="addAll"
          >
            {{
              isPending()
                ? 'Ajout en cours…'
                : `Ajouter ces ${results.length} jeux de données`
            }}
          </button>
        </div>
      </div>
      <ul class="tag-results-list">
        <li v-for="dataset in results" :key="dataset.id" class="fr-p-2w">
          {{ dataset.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tag-results-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 16rem;
  overflow-y: auto;
}
.tag-results-list li {
  border: 1px solid var(--border-default-grey, #ddd);
  border-radius: 0.25rem;
  background-color: var(--background-default-grey, #fff);
  font-size: 0.85rem;
}
</style>

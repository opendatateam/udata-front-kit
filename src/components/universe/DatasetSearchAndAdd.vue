<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import {
  getOwnerName,
  OrganizationNameWithCertificate
} from '@datagouv/components-next'
import { ref } from 'vue'

import SearchAPI from '@/services/api/SearchAPI'
import { stripFromMarkdown } from '@/utils'

const props = defineProps<{
  selectedIds: string[]
  pendingIds: string[]
}>()

const emit = defineEmits<{
  add: [dataset: { id: string; title: string }]
}>()

const query = ref('')
const results = ref<DatasetV2[]>([])
const loading = ref(false)
const searched = ref(false)
const error = ref<string | null>(null)

const search = async () => {
  if (!query.value.trim()) return
  loading.value = true
  error.value = null
  searched.value = true
  try {
    const response = await new SearchAPI().search(query.value.trim(), {
      page: 1,
      page_size: 10
    })
    results.value = response.data
  } catch {
    error.value = 'Échec de la recherche.'
  } finally {
    loading.value = false
  }
}

const isSelected = (dataset: DatasetV2) =>
  props.selectedIds.includes(dataset.id)
const isPending = (dataset: DatasetV2) => props.pendingIds.includes(dataset.id)
</script>

<template>
  <div class="dataset-search">
    <div class="fr-search-bar" role="search">
      <label class="fr-label" for="universe-dataset-search"
        >Rechercher un jeu de données</label
      >
      <input
        id="universe-dataset-search"
        v-model="query"
        class="fr-input"
        type="search"
        placeholder="Rechercher un jeu de données"
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
      Aucun jeu de données trouvé.
    </p>

    <ul v-else-if="results.length" class="dataset-results-list fr-mt-2w">
      <li v-for="dataset in results" :key="dataset.id" class="fr-p-2w">
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
          <div class="fr-col">
            <p class="fr-m-0 fr-text--bold">
              {{ dataset.title }}
              <a
                :href="dataset.page"
                target="_blank"
                rel="noopener"
                class="fr-icon-external-link-line fr-link--icon-right"
                :title="`Voir « ${dataset.title} » sur data.gouv.fr`"
                ><span class="fr-sr-only">Voir sur data.gouv.fr</span></a
              >
            </p>
            <p class="fr-m-0 fr-text--xs">
              <template v-if="dataset.organization">
                <OrganizationNameWithCertificate
                  :organization="dataset.organization"
                />
              </template>
              <template v-else>{{ getOwnerName(dataset) }}</template>
              · {{ dataset.resources.total }} ressource{{
                dataset.resources.total > 1 ? 's' : ''
              }}
            </p>
            <p class="fr-m-0 fr-mt-1v fr-text--sm dataset-description">
              {{ stripFromMarkdown(dataset.description, 200) }}
            </p>
          </div>
          <div class="fr-col-auto">
            <button
              v-if="isSelected(dataset)"
              type="button"
              class="fr-btn fr-icon-check-line fr-btn--icon-left"
              disabled
            >
              Sélectionné
            </button>
            <button
              v-else
              type="button"
              class="fr-btn fr-btn--secondary fr-icon-add-line fr-btn--icon-left"
              :disabled="isPending(dataset)"
              @click="emit('add', { id: dataset.id, title: dataset.title })"
            >
              {{ isPending(dataset) ? 'Ajout…' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dataset-results-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.dataset-results-list li {
  border: 1px solid var(--border-default-grey, #ddd);
  border-radius: 0.25rem;
  background-color: var(--background-default-grey, #fff);
}
.dataset-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

import SearchOrgAPI from '@/services/api/SearchOrgAPI'

// The organizations/suggest endpoint (a fast autocomplete, not the full
// organization resource) returns a minimal shape — confirmed live:
// {acronym, id, image_url, name, page, slug}, no metrics/description/logo.
// SearchOrgAPI.search()'s TS signature claims Organization[] (the full
// type), which is wrong and crashed on organization.metrics being
// undefined — this local type reflects what the API actually returns.
interface SuggestedOrganization {
  id: string
  name: string
  acronym: string | null
  image_url: string
  page: string
  slug: string
}

const props = defineProps<{
  pendingOrgId: string | null
}>()

const emit = defineEmits<{
  add: [organization: { id: string; name: string }]
}>()

const query = ref('')
const results = ref<SuggestedOrganization[]>([])
const loading = ref(false)
const searched = ref(false)
const error = ref<string | null>(null)
// Local only — bulk-add is fire-and-forget from this component's point of
// view (the actual dataset list lives in UniverseStore), this just tracks
// which orgs were triggered from here so the button can show "Ajouté".
const triggeredOrgIds = ref(new Set<string>())

const search = async () => {
  if (!query.value.trim()) return
  loading.value = true
  error.value = null
  searched.value = true
  try {
    results.value = (await new SearchOrgAPI().search(
      query.value.trim(),
      10
    )) as unknown as SuggestedOrganization[]
  } catch {
    error.value = 'Échec de la recherche.'
  } finally {
    loading.value = false
  }
}

const addOrganization = (organization: SuggestedOrganization) => {
  triggeredOrgIds.value.add(organization.id)
  emit('add', { id: organization.id, name: organization.name })
}

const isPending = (organization: SuggestedOrganization) =>
  props.pendingOrgId === organization.id
const isDone = (organization: SuggestedOrganization) =>
  triggeredOrgIds.value.has(organization.id) && !isPending(organization)
</script>

<template>
  <div class="org-search">
    <div class="fr-search-bar" role="search">
      <label class="fr-label" for="universe-org-search"
        >Rechercher une organisation</label
      >
      <input
        id="universe-org-search"
        v-model="query"
        class="fr-input"
        type="search"
        placeholder="Rechercher une organisation"
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
      Aucune organisation trouvée.
    </p>

    <ul v-else-if="results.length" class="org-results-list fr-mt-2w">
      <li
        v-for="organization in results"
        :key="organization.id"
        class="fr-p-2w"
      >
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
          <div class="fr-col-auto">
            <img
              :src="organization.image_url"
              alt=""
              loading="lazy"
              width="40"
              height="40"
              class="org-logo"
            />
          </div>
          <div class="fr-col">
            <p class="fr-m-0 fr-text--bold">
              {{ organization.name }}
              <a
                :href="organization.page"
                target="_blank"
                rel="noopener"
                class="fr-icon-external-link-line fr-link--icon-right"
                :title="`Voir « ${organization.name} » sur data.gouv.fr`"
                ><span class="fr-sr-only">Voir sur data.gouv.fr</span></a
              >
            </p>
            <p class="fr-m-0 fr-text--xs">
              Ajoute tous les jeux de données de cette organisation — peut
              prendre du temps pour une grande organisation.
            </p>
          </div>
          <div class="fr-col-auto">
            <button
              v-if="isDone(organization)"
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
              :disabled="isPending(organization)"
              @click="addOrganization(organization)"
            >
              {{
                isPending(organization)
                  ? 'Ajout en cours…'
                  : 'Ajouter tous ses jeux de données'
              }}
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.org-results-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.org-results-list li {
  border: 1px solid var(--border-default-grey, #ddd);
  border-radius: 0.25rem;
  background-color: var(--background-default-grey, #fff);
}
.org-logo {
  object-fit: contain;
  border-radius: 0.25rem;
}
</style>

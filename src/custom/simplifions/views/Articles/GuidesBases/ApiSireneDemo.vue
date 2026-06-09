<template>
  <div class="sirene-demo">
    <p class="fr-text--sm fr-mb-2w sirene-demo__label">
      <span class="fr-icon-code-s-slash-line fr-mr-1v" aria-hidden="true" />
      Démonstrateur avec l'API Sirene
    </p>
  

    <form @submit.prevent="search">
      <div class="fr-input-group" :class="{ 'fr-input-group--error': error }">
        <label class="fr-label fr-text--bold" for="siret-demo-input">
          Numéro de SIRET d'un établissement :
        </label>
        <input
          id="siret-demo-input"
          v-model="siretInput"
          class="fr-input"
          :class="{ 'fr-input--error': error }"
          type="text"
          inputmode="numeric"
          maxlength="14"
          placeholder="35600000000048"
          autocomplete="off"
          :disabled="loading"
          @input="onInput"
        />
        <p v-if="error" id="siret-demo-error" class="fr-error-text">{{ error }}</p>
      </div>
      <button
        type="submit"
        class="fr-btn fr-btn--secondary fr-icon-search-line fr-btn--icon-left"
        :disabled="loading"
      >
        {{ loading ? 'Interrogation en cours…' : "Interroger l'API" }}
      </button>
    </form>

    <div v-if="loading" class="fr-mt-3w sirene-demo__loading" aria-live="polite">
      <div class="sirene-demo__spinner" aria-hidden="true" />
      <p class="fr-text--sm fr-mb-0">Interrogation de l'API en cours…</p>
    </div>

    <div v-if="result" class="fr-mt-3w sirene-demo__result">
      <p class="sirene-demo__company-name">{{ denomination }}</p>
      <p class="fr-text--sm fr-mb-2w sirene-demo__siret-display">
        SIRET : {{ formatSiret(result.siege?.siret ?? siretInput) }}
      </p>

      <dl class="sirene-demo__fields">
        <div v-if="adresse" class="sirene-demo__field">
          <dt>Adresse</dt>
          <dd>{{ adresse }}</dd>
        </div>
        <div v-if="result.siege?.activite_principale" class="sirene-demo__field">
          <dt>Activité principale (Code NAF)</dt>
          <dd>{{ result.siege.activite_principale }}</dd>
        </div>
        <div v-if="categorieJuridique" class="sirene-demo__field">
          <dt>Forme juridique (code)</dt>
          <dd>{{ categorieJuridique }}</dd>
        </div>
        <div class="sirene-demo__field">
          <dt>État administratif </dt>
          <dd>
            <span
              class="fr-badge fr-badge--sm"
              :class="estActif ? 'fr-badge--success' : 'fr-badge--error'"
            >
              {{ estActif ? 'Actif' : 'Fermé' }}
            </span>
          </dd>
        </div>
      </dl>

      <p class="fr-text--xs fr-mt-2w sirene-demo__source">
        Ces données ont été récupérées en temps réel auprès de l'API SIRENE,
        sans que vous ayez eu à les saisir manuellement.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const siretInput = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<Record<string, any> | null>(null)

const onInput = () => {
  error.value = ''
  result.value = null
}

const search = async () => {
  const siret = siretInput.value.trim()
  if (siret.length !== 14) {
    error.value = 'Le numéro SIRET doit contenir exactement 14 chiffres.'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const siren = siret.slice(0, 9)
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${siren}&page=1&per_page=1`
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    if (!data.results?.length) {
      error.value = 'Aucune entreprise trouvée pour ce numéro SIRET.'
      return
    }
    result.value = data.results[0]
  } catch {
    error.value = 'Une erreur est survenue lors de la requête. Vérifiez le numéro et réessayez.'
  } finally {
    loading.value = false
  }
}

const denomination = computed(() =>
  result.value?.nom_complet || result.value?.nom_raison_sociale || '—'
)

const adresse = computed(() =>
  result.value?.siege?.adresse ?? ''
)

const categorieJuridique = computed(() =>
  result.value?.siege?.libelle_nature_juridique ?? result.value?.nature_juridique ?? ''
)

const estActif = computed(() =>
  result.value?.etat_administratif === 'A'
)

const formatSiret = (s: string) =>
  s?.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4') ?? s
</script>

<style scoped>
.sirene-demo {
  background: var(--background-alt-grey);
  border-left: 4px solid var(--border-action-high-blue-france);
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.sirene-demo__label {
  color: var(--text-mention-grey);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sirene-demo__loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-mention-grey);
}

.sirene-demo__spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--border-default-grey);
  border-top-color: var(--border-action-high-blue-france);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sirene-demo__result {
  background: var(--background-default-grey);
  border-radius: 4px;
  padding: 1.25rem;
}

.sirene-demo__company-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-title-blue-france);
  margin: 0 0 0.25rem;
}

.sirene-demo__siret-display {
  color: var(--text-mention-grey);
  margin-bottom: 1rem;
}

.sirene-demo__fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 0;
}

.sirene-demo__field {
  background: var(--background-alt-grey);
  border-radius: 4px;
  padding: 0.625rem 0.875rem;
}

.sirene-demo__field dt {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-mention-grey);
  margin-bottom: 0.25rem;
}

.sirene-demo__field dd {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-default-grey);
}

.sirene-demo__source {
  color: var(--text-mention-grey);
  font-style: italic;
  border-top: 1px solid var(--border-default-grey);
  padding-top: 0.75rem;
  margin-bottom: 0;
}
</style>

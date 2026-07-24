<template>
  <div class="fr-callout fr-p-6v fr-my-6v sirene-demo">
    <p class="fr-text--sm fr-mb-2w sirene-demo__label">
      <span class="fr-icon-code-s-slash-line fr-mr-1v" aria-hidden="true" />
      Démonstrateur avec l'API Sirene
    </p>

    <form @submit.prevent="search">
      <DsfrInputGroup
        id="siret-demo-input"
        v-model="siretInput"
        label="Numéro de SIRET d'un établissement :"
        :error-message="error || undefined"
        inputmode="numeric"
        maxlength="14"
        placeholder="35600000000048"
        autocomplete="off"
        :disabled="loading"
        @update:model-value="onInput"
      />
      <DsfrButton
        type="submit"
        secondary
        icon="fr-icon-search-line"
        :disabled="loading"
        :label="buttonLabel"
      />
    </form>

    <div
      v-if="loading"
      class="fr-mt-3w sirene-demo__loading"
      aria-live="polite"
    >
      <div class="sirene-demo__spinner" aria-hidden="true" />
      <p class="fr-text--sm fr-mb-0">Interrogation de l'API en cours…</p>
    </div>

    <div v-if="result" class="fr-mt-3w fr-p-5v sirene-demo__result">
      <p class="fr-text--bold fr-text--lg fr-mb-1v sirene-demo__company-name">
        {{ denomination }}
      </p>
      <p class="fr-text--sm fr-mb-2w sirene-demo__siret-display">
        SIRET : {{ formatSiret(result.siege?.siret ?? siretInput) }}
      </p>

      <dl class="fr-grid-row fr-grid-row--gutters">
        <div v-if="adresse" class="fr-col-12 fr-col-sm-6">
          <div class="sirene-demo__field fr-p-3v">
            <dt class="fr-mb-1v fr-text--xs">Adresse</dt>
            <dd>{{ adresse }}</dd>
          </div>
        </div>
        <div
          v-if="result.siege?.activite_principale"
          class="fr-col-12 fr-col-sm-6"
        >
          <div class="sirene-demo__field fr-p-3v">
            <dt class="fr-mb-1v fr-text--xs">Activité principale (Code NAF)</dt>
            <dd>{{ result.siege.activite_principale }}</dd>
          </div>
        </div>
        <div v-if="categorieJuridique" class="fr-col-12 fr-col-sm-6">
          <div class="sirene-demo__field fr-p-3v">
            <dt class="fr-mb-1v fr-text--xs">Forme juridique (code)</dt>
            <dd>{{ categorieJuridique }}</dd>
          </div>
        </div>
        <div class="fr-col-12 fr-col-sm-6">
          <div class="sirene-demo__field fr-p-3v">
            <dt class="fr-mb-1v fr-text--xs">État administratif</dt>
            <dd class="fr-m-0 fr-text--sm">
              <span
                class="fr-badge fr-badge--sm"
                :class="estActif ? 'fr-badge--success' : 'fr-badge--error'"
              >
                {{ estActif ? 'Actif' : 'Fermé' }}
              </span>
            </dd>
          </div>
        </div>
      </dl>

      <p class="fr-text--xs fr-mt-2w fr-pt-3v fr-mb-0">
        <i
          >Ces données ont été récupérées en temps réel auprès de l'API SIRENE,
          sans que vous ayez eu à les saisir manuellement.</i
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const siretInput = ref('')
const loading = ref(false)
const error = ref('')

type SireneEntreprise = {
  nom_complet?: string
  nom_raison_sociale?: string
  nature_juridique?: string
  etat_administratif?: string
  siege?: {
    siret?: string
    adresse?: string
    activite_principale?: string
    libelle_nature_juridique?: string
  }
}

const result = ref<SireneEntreprise | null>(null)

const onInput = () => {
  error.value = ''
  result.value = null
}

const search = async () => {
  const siret = siretInput.value.trim()
  if (!/^\d{14}$/.test(siret)) {
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
    error.value =
      'Une erreur est survenue lors de la requête. Vérifiez le numéro et réessayez.'
  } finally {
    loading.value = false
  }
}

const denomination = computed(
  () => result.value?.nom_complet || result.value?.nom_raison_sociale || '—'
)

const adresse = computed(() => result.value?.siege?.adresse ?? '')

const categorieJuridique = computed(
  () =>
    result.value?.siege?.libelle_nature_juridique ??
    result.value?.nature_juridique ??
    ''
)

const estActif = computed(() => result.value?.etat_administratif === 'A')

const buttonLabel = computed(() =>
  loading.value ? 'Interrogation en cours…' : "Interroger l'API"
)

const formatSiret = (s: string) =>
  s.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')
</script>

<style scoped>
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
  to {
    transform: rotate(360deg);
  }
}

.sirene-demo__result {
  background: var(--background-default-grey);
  border-radius: 4px;
}

.sirene-demo__company-name {
  color: var(--text-title-blue-france);
}

.sirene-demo__siret-display {
  color: var(--text-mention-grey);
}

.sirene-demo__field {
  background: var(--background-alt-grey);
  border-radius: 4px;
  height: 100%;
  box-sizing: border-box;
}
</style>

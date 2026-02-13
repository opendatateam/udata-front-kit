<template>
  <div class="test__integrateurs-filters fr-py-3w fr-mb-2w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <!-- Type de solutions filter -->
      <div class="fr-col-12 fr-col-md-4">
        <div class="fr-select-group">
          <label for="type-solutions" class="fr-label">
            Type de solutions :
          </label>
          <select
            id="type-solutions"
            v-model="selectedTypeSolution"
            class="fr-select"
            @change="emitFilters"
          >
            <option value="">Tous les types</option>
            <option
              v-for="type in availableTypeSolutions"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>
      </div>

      <!-- Cas d'usage filter -->
      <div class="fr-col-12 fr-col-md-4">
        <div class="fr-select-group">
          <label for="cas-usage" class="fr-label"> Cas d'usage : </label>
          <select
            id="cas-usage"
            v-model="selectedCasUsage"
            class="fr-select"
            @change="emitFilters"
          >
            <option :value="null">Tous les cas d'usages</option>
            <option
              v-for="casUsage in availableCasUsages"
              :key="casUsage.id"
              :value="casUsage.id"
            >
              {{ casUsage.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- APIs/datasets filter -->
      <div class="fr-col-12 fr-col-md-4">
        <div class="fr-select-group">
          <label for="min-apis" class="fr-label">
            API ou jeux de données intégrés :
          </label>
          <select
            id="min-apis"
            v-model="minApisIntegrated"
            class="fr-select"
            @change="emitFilters"
          >
            <option :value="0">Tous</option>
            <option v-for="n in maxApisCount" :key="n" :value="n">
              Au moins {{ n }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <!-- Third row: count + sort -->
  <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
    <div class="fr-col-12 fr-col-md-6">
      <p class="fr-text--bold fr-mb-0 fr-ml-2w">
        {{ filteredCount }} solution{{
          filteredCount > 1 ? 's' : ''
        }}
        disponible{{ filteredCount > 1 ? 's' : '' }}
      </p>
    </div>

    <div class="fr-col-12 fr-col-md-6">
      <div class="sort-container">
        <label for="sort-by" class="fr-label fr-mr-2w"> Trier par : </label>
        <select
          id="sort-by"
          v-model="sortBy"
          class="fr-select fr-select--inline"
          @change="emitFilters"
        >
          <option value="integration">Le plus de données intégrées</option>
          <option value="title">Titre</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CasUsageRecord } from '../model/grist'

export interface IntegrateursFilters {
  typeSolution: string
  casUsage: number | null
  minApisIntegrated: number
  sortBy: string
}

const props = defineProps<{
  availableTypeSolutions: string[]
  casUsages: CasUsageRecord[]
  maxApisCount: number
  filteredCount: number
}>()

const emit = defineEmits<{
  'update:filters': [filters: IntegrateursFilters]
}>()

const selectedTypeSolution = ref('')
const selectedCasUsage = ref<number | null>(null)
const minApisIntegrated = ref(0)
const sortBy = ref('integration')

const availableCasUsages = computed(() => {
  return props.casUsages.map((cu) => ({
    id: cu.id,
    name: cu.fields.Nom
  }))
})

const emitFilters = () => {
  emit('update:filters', {
    typeSolution: selectedTypeSolution.value,
    casUsage: selectedCasUsage.value,
    minApisIntegrated: minApisIntegrated.value,
    sortBy: sortBy.value
  })
}
</script>

<style scoped>
.sort-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.sort-container .fr-label {
  margin-bottom: 0;
  white-space: nowrap;
}

.fr-select--inline {
  width: auto;
  min-width: 220px;
}

@media (max-width: 767px) {
  .sort-container {
    justify-content: flex-start;
  }
}
</style>

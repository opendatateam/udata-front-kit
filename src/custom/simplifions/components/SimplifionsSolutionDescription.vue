<template>
  <!-- eslint-disable vue/no-v-html -->
  <ContentPlaceholder v-if="!solution" />
  <div v-else class="solution-description">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">
            {{ topic.name }}
          </h1>
          <DraftTag v-if="topic.private" />
          <SimplifionsSolutionTag :topic-solution="topic" />
        </div>

        <p class="fr-text--lead">
          {{ topic.description }}
        </p>

        <SimplifionsTags
          :topic="topic"
          :page-key="pageKey"
          :show-simplification="false"
          :show-budget="false"
        />

        <ul class="fr-mt-4w">
          <li>
            <strong>Fournisseur : </strong>
            <HumanReadableList
              v-if="solution.Nom_de_l_operateur?.length"
              :items="solution.Nom_de_l_operateur"
              :bold-items="false"
            />
            <span v-else>Non renseigné</span>
          </li>
          <li>
            <strong>Type de solution : </strong>
            <HumanReadableList
              v-if="solution.Type_de_solution?.length"
              :items="solution.Type_de_solution"
              :bold-items="false"
              last-item-separator="ou"
            />
            <span v-else>Non renseigné</span>
          </li>
        </ul>

        <ul class="solution-links fr-btns-group fr-btns-group--inline fr-my-4w">
          <li v-if="solution.Site_internet">
            <a
              rel="noopener noreferrer"
              :href="solution.Site_internet"
              class="fr-btn fr-btn--secondary"
              target="_blank"
            >
              Site de la solution
            </a>
          </li>
          <li v-if="solution.URL_demande_d_acces">
            <a
              rel="noopener noreferrer"
              :href="solution.URL_demande_d_acces"
              class="fr-btn"
              target="_blank"
            >
              Demande d'accès
            </a>
          </li>
        </ul>
        <p v-if="!solution.Site_internet" class="fr-text--sm">
          <i>Aucun lien vers un site officiel actuellement.</i>
        </p>
      </div>

      <div class="fr-col-12 fr-col-md-4">
        <nav
          role="navigation"
          aria-labelledby="fr-summary-title"
          class="fr-summary"
        >
          <h2 id="fr-summary-title" class="fr-summary__title fr-text--md">
            Sommaire
          </h2>
          <ol>
            <li>
              <a href="#possibilites-simplification" class="fr-summary__link"
                >Possibilités de simplification</a
              >
            </li>
            <li>
              <a href="#cas-usages-simplifiables" class="fr-summary__link"
                >Cas d'usages simplifiables</a
              >
            </li>
            <li v-if="solution.API_ou_datasets_integres?.length">
              <a href="#donnees-api-utilisees" class="fr-summary__link"
                >Données et API utilisées</a
              >
            </li>
            <li v-if="solution.APIs_ou_datasets_fournis?.length">
              <a href="#donnees-api-fournies" class="fr-summary__link"
                >Données et API fournies</a
              >
            </li>
            <li v-else>
              <a href="#donnees-api" class="fr-summary__link">Données et API</a>
            </li>
            <li v-if="solutionsIntegratices.length">
              <a href="#solutions-integratices" class="fr-summary__link"
                >Solutions intégratrices</a
              >
            </li>
          </ol>
          <hr class="fr-hr fr-my-2w" />
          <p class="fr-text--sm">
            <span class="subtitle">Contenu rédigé par :</span>
            <span v-if="topic.organization">
              <a :href="topic.organization.page">
                <OrganizationNameWithCertificate
                  :organization="topic.organization"
                />
              </a>
            </span>
            <br />
            <span>
              le
              <time :datetime="topic.created_at"
                >{{ formatDate(topic.created_at) }}.</time
              >
            </span>
            <br />
            <span class="fr-text--xs"
              >Modifié le
              <time :datetime="topic.last_modified"
                >{{ formatDate(topic.last_modified) }}.</time
              >
            </span>
          </p>
          <span>
            <a href="#modification-contenu">✍️ Proposer une modification</a>
          </span>
        </nav>
      </div>
    </div>

    <hr v-if="!solution.Image" class="fr-hr fr-my-2w" />
    <figure
      v-if="solution.Image?.length"
      aria-label="© Légende de l'image"
      role="group"
      class="fr-content-media"
    >
      <div class="example-image fr-content-media__img">
        <img
          :alt="solution.Legende_de_l_image || ''"
          :src="grist.imageUrl(solution.Image?.[0])"
          class="fr-responsive-img fr-ratio-16x9"
        />
      </div>
      <figcaption
        v-if="solution.Legende_de_l_image"
        class="fr-content-media__caption"
      >
        {{ solution.Legende_de_l_image }}
      </figcaption>
    </figure>

    <div class="fr-col-12 fr-col-md-8 fr-mb-4w">
      <h2 id="possibilites-simplification" class="colored-title fr-h2 fr-my-5w">
        Possibilités de simplification
      </h2>

      <div>
        <h3 class="fr-text--md fr-mt-2w">
          <span
            aria-hidden="true"
            class="fr-icon-success-fill icon-green"
          ></span>
          Cette solution permet :
        </h3>
        <p
          v-if="solution.Cette_solution_permet"
          v-html="fromMarkdown(solution.Cette_solution_permet)"
        ></p>
        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>

      <div>
        <h3 class="fr-text--md fr-mt-2w">
          <span aria-hidden="true" class="fr-icon-error-fill icon-red"></span>
          Cette solution ne permet pas :
        </h3>
        <p
          v-if="solution.Cette_solution_ne_permet_pas"
          v-html="fromMarkdown(solution.Cette_solution_ne_permet_pas)"
        ></p>
        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>
    </div>

    <h2 id="cas-usages-simplifiables" class="colored-title fr-h2 fr-my-5w">
      Cas d'usages simplifiables
    </h2>
    <div
      v-if="solution.Recommande_pour_les_cas_d_usages?.length"
      class="fr-grid-row fr-grid-row--gutters"
    >
      <SimplifionsCasDusageRelatedCard
        v-for="casUsageId in solution.Recommande_pour_les_cas_d_usages"
        :key="casUsageId"
        :cas-usage-id="casUsageId"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4 fr-mb-3w"
      />
    </div>

    <p v-else class="fr-text--sm">
      <i>Aucun cas d'usage n'est référencé pour cette solution actuellement.</i>
      <a href="#modification-contenu">✍️ Proposer des cas d'usages</a>
    </p>

    <div
      v-if="solution.API_ou_datasets_integres?.length"
      id="donnees-api-utilisees"
    >
      <h2 class="colored-title fr-h2 fr-mt-8w">Données et API utilisées</h2>
      <ul class="fr-grid-row fr-grid-row--gutters list-none fr-pt-2w">
        <li
          v-for="apiOrDataset in apiOrDatasets"
          :key="apiOrDataset.UID_datagouv"
          class="fr-col-12 fr-py-0 fr-mb-2w"
        >
          <SimplifionsDataApi :api-or-dataset="apiOrDataset" title-tag="h3" />
        </li>
      </ul>
    </div>

    <div
      v-if="solution.APIs_ou_datasets_fournis?.length"
      id="donnees-api-fournies"
    >
      <h2 class="colored-title fr-h2 fr-mt-8w">Données et API fournies</h2>
      <ul class="fr-grid-row fr-grid-row--gutters list-none fr-pt-2w">
        <li
          v-for="apiOrDataset in apisOrDatasetsFournis"
          :key="apiOrDataset.UID_datagouv"
          class="fr-col-12 fr-py-0 fr-mb-2w"
        >
          <SimplifionsDataApi :api-or-dataset="apiOrDataset" title-tag="h3" />
        </li>
      </ul>
    </div>

    <div v-else id="donnees-api">
      <h2 class="colored-title fr-h2 fr-mt-8w">Données et API</h2>
      <p class="fr-text--sm">
        <i
          >Aucun jeu de données ou API utilisé ou fourni par cette solution
          actuellement.</i
        >
        <a href="#modification-contenu">✍️ Proposer un contenu</a>.
      </p>
    </div>

    <div
      v-if="solutionsIntegratices.length"
      id="solutions-integratices"
      class="solutions-integratices-container fr-p-3w fr-mt-8w"
    >
      <h2 class="colored-title fr-h2">
        Solutions intégrant "{{ topic.name }}"
      </h2>

      <SimplifionsIntegrateursFilters
        v-if="solutionsIntegratices.length > 1"
        :available-type-solutions="availableTypeSolutions"
        :cas-usages="casUsagesForIntegrateurs"
        :max-apis-count="maxApisCount"
        :filtered-count="filteredAndSortedSolutions.length"
        @update:filters="onFiltersUpdate"
      />

      <ul class="fr-grid-row fr-grid-row--gutters list-none">
        <li
          v-for="integrateur in filteredAndSortedSolutions"
          :key="integrateur.id"
          class="fr-col-12 fr-mb-2w"
        >
          <SimplifionsIntegrateurCard
            :solution="integrateur"
            :cas-usages="casUsagesForIntegrateurs"
            :useful-apis-by-cas-usage="usefulApisByCasUsage"
            :nom-fournisseur="topic.name"
            :api-et-datasets-integres="
              apiEtDatasetsIntegresParSolution.get(integrateur.id) || []
            "
          />
        </li>
      </ul>

      <p
        v-if="filteredAndSortedSolutions.length === 0"
        class="fr-text--sm fr-text--center"
      >
        <i>Aucune solution ne correspond aux filtres sélectionnés.</i>
      </p>
    </div>

    <div id="modification-contenu" class="bloc-modifications fr-mt-10w">
      <h2 class="fr-h6">✍️ Proposer une modification du contenu</h2>
      <p class="fr-mb-0">
        Pour proposer une modification du contenu de cette solution, vous pouvez
        contacter l'équipe via l'espace "Discussions" ci-dessous ou bien
        compléter
        <a
          href="https://www.demarches-simplifiees.fr/commencer/proposer-un-contenu-pour-le-site-simplifions"
          rel="noopener noreferer"
          target="_blank"
          >ce formulaire</a
        >.
      </p>
    </div>
  </div>
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup lang="ts">
import ContentPlaceholder from '@/components/ContentPlaceholder.vue'
import type { Topic } from '@/model/topic'
import { formatDate, fromMarkdown } from '@/utils'
import { OrganizationNameWithCertificate } from '@datagouv/components-next'
import { grist } from '../grist'
import type {
  ApiEtDatasetsIntegresRecord,
  ApiOrDataset,
  CasUsageRecord,
  RecommandationRecord,
  Solution,
  SolutionRecord
} from '../model/grist'
import type { TopicSolutionsExtras } from '../model/topics'
import SimplifionsCasDusageRelatedCard from './SimplifionsCasDusageRelatedCard.vue'
import SimplifionsDataApi from './SimplifionsDataApi.vue'
import SimplifionsIntegrateurCard from './SimplifionsIntegrateurCard.vue'
import SimplifionsIntegrateursFilters, {
  type IntegrateursFilters
} from './SimplifionsIntegrateursFilters.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
  hideLoader: (() => void) | null
}>()

const solutionId = (props.topic.extras as TopicSolutionsExtras)[
  'simplifions-v2-solutions'
].id

const solution = ref<Solution | undefined>(undefined)
const apiOrDatasets = ref<ApiOrDataset[] | undefined>(undefined)
const apisOrDatasetsFournis = ref<ApiOrDataset[] | undefined>(undefined)
const solutionsIntegratices = ref<SolutionRecord[]>([])
const casUsagesForIntegrateurs = ref<CasUsageRecord[]>([])
const recommandationsFournisseur = ref<RecommandationRecord[]>([])
const apiEtDatasetsIntegres = ref<ApiEtDatasetsIntegresRecord[]>([])
const integrateursFilters = ref<IntegrateursFilters>({
  typeSolution: '',
  casUsage: null,
  minApisIntegrated: 0,
  sortBy: 'integration'
})

grist.getRecord('Solutions', solutionId).then((data) => {
  solution.value = data.fields as Solution

  // hide parent component loader
  props.hideLoader?.()

  if (solution.value.API_ou_datasets_integres?.length) {
    grist
      .getRecordsByIds(
        'APIs_et_datasets',
        solution.value.API_ou_datasets_integres
      )
      .then((data) => {
        apiOrDatasets.value = (
          data.map((record) => record.fields) as ApiOrDataset[]
        ).filter((apiOrDataset) => apiOrDataset.Visible_sur_simplifions)
      })
  }

  if (solution.value.APIs_ou_datasets_fournis?.length) {
    grist
      .getRecordsByIds(
        'APIs_et_datasets',
        solution.value.APIs_ou_datasets_fournis
      )
      .then((data) => {
        apisOrDatasetsFournis.value = (
          data.map((record) => record.fields) as ApiOrDataset[]
        ).filter((apiOrDataset) => apiOrDataset.Visible_sur_simplifions)
      })
  }

  if (solution.value.solutions_integratrices?.length) {
    // Fetch integrator solution details
    grist
      .getRecordsByIds('Solutions', solution.value.solutions_integratrices)
      .then((solutions) => {
        solutionsIntegratices.value = (solutions as SolutionRecord[]).filter(
          (sol) => sol.fields.Visible_sur_simplifions
        )
      })

    // Fetch Recommendations for the supplier solution to get per-use-case API requirements (Y values)
    grist
      .getRecords('Recommandations', { Solution_recommandee: [solutionId] })
      .then((recommendations) => {
        recommandationsFournisseur.value =
          recommendations as RecommandationRecord[]
      })

    // Fetch API_et_datasets_integres - this is the main source of truth
    grist
      .getRecords('API_et_datasets_integres', {
        Solution_fournisseur: [solutionId]
      })
      .then((integrations) => {
        apiEtDatasetsIntegres.value =
          integrations as ApiEtDatasetsIntegresRecord[]

        // Derive cas d'usage IDs from integration data and fetch them
        const allCasUsageIds = new Set<number>()
        integrations.forEach((integration) => {
          const useCases =
            (integration as ApiEtDatasetsIntegresRecord).fields
              .Integre_pour_les_cas_d_usages || []
          useCases.forEach((id) => allCasUsageIds.add(id))
        })

        if (allCasUsageIds.size > 0) {
          grist
            .getRecordsByIds('Cas_d_usages', Array.from(allCasUsageIds))
            .then((casUsages) => {
              casUsagesForIntegrateurs.value = casUsages as CasUsageRecord[]
            })
        }
      })
  }
})

// Computed properties for filters
const availableTypeSolutions = computed(() => {
  const types = new Set<string>()
  solutionsIntegratices.value.forEach((sol) => {
    sol.fields.Type_de_solution?.forEach((type) => {
      types.add(type)
    })
  })
  return Array.from(types).sort()
})

// Map of cas d'usage ID -> useful APIs/datasets IDs (Y value per use case)
const usefulApisByCasUsage = computed(() => {
  const map = new Map<number, number[]>()
  recommandationsFournisseur.value.forEach((rec) => {
    const casUsageId = rec.fields.Cas_d_usage
    const usefulApis = rec.fields.API_et_datasets_utiles_fournis || []
    map.set(casUsageId, usefulApis)
  })
  return map
})

// Map of integrator solution ID -> their API integrations
const apiEtDatasetsIntegresParSolution = computed(() => {
  const map = new Map<number, ApiEtDatasetsIntegresRecord[]>()
  apiEtDatasetsIntegres.value.forEach((integration) => {
    const solutionId = integration.fields.Solution_integratrice
    if (!map.has(solutionId)) {
      map.set(solutionId, [])
    }
    map.get(solutionId)!.push(integration)
  })
  return map
})

const maxApisCount = computed(() => {
  return Math.max(
    0,
    ...solutionsIntegratices.value.map(
      (sol) => sol.fields.API_ou_datasets_integres?.length ?? 0
    )
  )
})

const getIntegrationCount = (sol: SolutionRecord) => {
  return sol.fields.API_ou_datasets_integres?.length ?? 0
}

const filteredAndSortedSolutions = computed(() => {
  let filtered = [...solutionsIntegratices.value]

  // Filter by type de solution (single select)
  if (integrateursFilters.value.typeSolution) {
    filtered = filtered.filter((sol) =>
      sol.fields.Type_de_solution?.includes(
        integrateursFilters.value.typeSolution
      )
    )
  }

  // Filter by cas d'usage (single select) - based on integration data
  if (integrateursFilters.value.casUsage !== null) {
    filtered = filtered.filter((sol) => {
      const integrations =
        apiEtDatasetsIntegresParSolution.value.get(sol.id) || []
      return integrations.some((integration) =>
        integration.fields.Integre_pour_les_cas_d_usages?.includes(
          integrateursFilters.value.casUsage as number
        )
      )
    })
  }

  // Filter by min APIs integrated
  if (integrateursFilters.value.minApisIntegrated > 0) {
    filtered = filtered.filter((sol) => {
      const integratedCount = getIntegrationCount(sol)
      return integratedCount >= integrateursFilters.value.minApisIntegrated
    })
  }

  // Sort based on sortBy value
  return filtered.sort((a, b) => {
    switch (integrateursFilters.value.sortBy) {
      case 'integration': {
        return getIntegrationCount(b) - getIntegrationCount(a)
      }
      case 'title': {
        return a.fields.Nom.localeCompare(b.fields.Nom)
      }
      default:
        return 0
    }
  })
})

const onFiltersUpdate = (filters: IntegrateursFilters) => {
  integrateursFilters.value = filters
}
</script>

<style scoped>
h2.colored-title {
  color: black;
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}
.example-image {
  display: inline-block;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 8px;
  border: 4px solid #000;
}

.example-image img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.inline-tag {
  display: inline-flex;
  margin-right: 0.5em;
  margin-left: 0.5em;
  padding: 0 0.5rem 0 0.5rem;
}

.icon-green {
  color: #27a658;
}

.icon-red {
  color: #ff292f;
}

.solutions-integratices-container {
  background-color: #f1f1f1;
}

.solutions-integratices-container :deep(.fr-select) {
  background-color: #fff;
}

.bloc-modifications {
  background-color: #f1f1f1;
  padding: 1rem;
}

/* Markdown spacing fix for all ul that are inside a p, and right after a p*/
:deep(p p + ul) {
  margin-top: -1rem !important;
  margin-bottom: 1rem !important;
}
</style>

<template>
  <div class="reco-card fr-p-2w fr-mb-4w">
    <h4 class="fr-h4 fr-mb-2w">
      ➡️ {{ recommandation.Nom_de_la_recommandation }}
    </h4>

    <div
      class="fr-grid-row  fr-grid-row--top fr-mx-2w"
    >
      <div class="fr-mt-2w fr-mb-2w fr-col-12 fr-col-md-6">
          <h5 class="fr-text--lg">
            <span aria-hidden="true" class="fr-icon-success-fill icon-green"></span>
            Données disponibles :
          </h5>
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="recommandation.Donnees_utiles_disponibles"
            class="fr-ml-3w"
            v-html="fromMarkdown(recommandation.Donnees_utiles_disponibles).html"
          ></div>
          <!-- eslint-enable vue/no-v-html -->
          <p v-else class="fr-ml-3w fr-text--sm fr-text--mention-grey">
            <i>Information non renseignée.</i>
          </p>
      </div>

      <div class="fr-px-2w fr-mt-2w fr-mb-2w fr-col-12 fr-col-md-6">
          <h5 class="fr-text--lg">
            <span aria-hidden="true">✍️</span>
            Informations à saisir pour récupérer la donnée :
          </h5>
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="recommandation.Parametres_a_saisir_pour_recuperer_les_donnees"
            class="fr-ml-3w"
            v-html="
              fromMarkdown(
                recommandation.Parametres_a_saisir_pour_recuperer_les_donnees
              ).html
            "
          ></div>
          <!-- eslint-enable vue/no-v-html -->
          <p v-else class="fr-ml-3w fr-text--sm fr-text--mention-grey">
            <i>Information non renseignée.</i>
          </p>
        </div>
    </div>

    <div class="fr-mt-2w fr-mx-2w">
    <h5 class="fr-text--lg fr-mb-2w">
      <span aria-hidden="true" class="fr-icon-arrow-right-circle-fill icon-black"></span>
      Moyens d'accès à ces données :
    </h5>

    <DsfrAccordionsGroup v-model="activeApiAccordion">
      <DsfrAccordion title-tag="h6">
        <template #title>Par l'API directement</template>

        <template v-if="isSolution">
          <div class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-2w">
            <router-link
              v-if="topicSlug"
              class="fr-btn fr-btn--secondary test__solution-link"
              :to="{ name: 'solutions_detail', params: { item_id: topicSlug } }"
            >
              Plus d'informations sur {{ recommandation.Nom_de_la_recommandation }}
            </router-link>
            <a
              v-if="recommandation.access_link_with_fallback"
              rel="noopener noreferrer"
              :href="recommandation.access_link_with_fallback"
              class="fr-btn test__access-link"
              target="_blank"
            >
              Demander un accès pour ce cas d'usage
            </a>
          </div>

          <div v-if="usefulDataApiFourniesParLaSolution === undefined">
            Chargement des données en cours...
          </div>
          <div v-else-if="sortedUsefulEndpoints?.length">
            <p class="fr-mt-4w"><b><span title="Un endpoint est une sous-partie d'une API, un point d'accès spécifique à l'intérieur de l'API." style="text-decoration: underline dotted; text-underline-offset: 3px;">Endpoints</span> de l'API utiles pour ce cas d'usage :</b></p>
            <div class="fr-table fr-table--multiline fr-table--no-caption fr-table--sm">
              <div class="fr-table__header">
                <div class="fr-search-bar" role="search">
                  <label class="fr-label" :for="searchId">Filtrer les endpoints</label>
                  <input
                    :id="searchId"
                    v-model="searchQuery"
                    class="fr-input"
                    type="search"
                    placeholder="Rechercher les endpoints utiles par mots-clés..."
                  />
                  <button type="button" class="fr-btn">Filtrer</button>
                </div>
              </div>
              <div ref="tableWrapperRef" class="fr-table__wrapper">
                <div class="fr-table__container">
                  <div class="fr-table__content">
                    <table>
                      <thead>
                        <tr class="">
                          <th class="fr-col--md fr-py-2w" scope="col">Endpoints utiles de l'API</th>
                          <th class="fr-col--lg fr-py-2w" scope="col">Description de l'utilité pour ce cas d'usage</th>
                        </tr>
                      </thead>
                      <tbody ref="tableBodyRef">
                        <tr v-if="!filteredEndpoints.length">
                          <td colspan="2"><i>Aucun endpoint ne correspond à votre recherche.</i></td>
                        </tr>
                        <template v-else>
                          <tr
                            v-for="record in displayedEndpoints"
                            :key="record.fields.UID_datagouv"
                            class="test__api-or-dataset-utile"
                          >
                            <td>
                              <b>{{ record.fields.Nom }}</b><br />
                              <a
                                :href="`https://www.data.gouv.fr/fr/${datagouvUrlType(record.fields)}/${record.fields.UID_datagouv}`"
                                target="_blank"
                                class="fr-link fr-link--xs"
                              >Documentation</a>
                            </td>
                            <!-- eslint-disable vue/no-v-html -->
                            <td
                              v-if="customDescriptions[record.id]?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage"
                              class="fr-text--sm fr-py-1w test__api-or-dataset-utile-description"
                              v-html="fromMarkdown(customDescriptions[record.id].En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage).html"
                            ></td>
                            <!-- eslint-enable vue/no-v-html -->
                            <td v-else>
                              <i class="fr-text--xs">Cet endpoint est identifié comme utile pour ce cas d'usage.</i>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div v-if="paginationPages.length > 1" class="fr-table__footer">
                <div class="fr-table__footer--start">
                  <p class="fr-table__detail">{{ filteredEndpoints.length }} endpoint{{ filteredEndpoints.length > 1 ? 's' : '' }}</p>
                </div>
                <div class="fr-table__footer--middle">
                  <DsfrPagination
                    :pages="paginationPages"
                    :current-page="currentPage"
                    @update:current-page="handlePageChange"
                  />
                </div>
              </div>
            </div>
          </div>



        </template>

        <template v-else>
          <div class="fr-grid-row fr-grid-row--right fr-mb-2w">
            <a
              v-if="access_url"
              rel="noopener noreferrer"
              :href="access_url"
              class="fr-btn test__access-link"
              target="_blank"
            >
              Demander un accès à {{ accessTypeLabel }} pour ce cas d'usage
            </a>
          </div>
          <SimplifionsDataApi
            v-if="apiOrDataset"
            :api-or-dataset="apiOrDataset"
            title-tag="h6"
            @resource-fetched="handleResourceFetched"
          />
        </template>
      </DsfrAccordion>
    </DsfrAccordionsGroup>

    <DsfrAccordionsGroup
      v-model="activeBriquesAccordion"
      :class="{ 'accordion-empty': !integratingSolutionsBriquesTechniques.length }"
    >
      <DsfrAccordion title-tag="h6">
        <template #title>Via une brique logicielle à intégrer</template>
        <p>
          <strong>Briques techniques logicielles</strong> destinées à être
          intégrées dans un système informatique existant et conçues pour le cas
          d'usage «<i
            >&nbsp;{{ recommandation.Nom_complet_du_cas_d_usage }}&nbsp;</i
          >» :
        </p>
        <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
          <div
            v-for="solution in integratingSolutionsBriquesTechniques"
            :key="solution.id"
            class="fr-col-12 fr-col-sm-6 fr-col-lg-4 fr-col-xl-3 fr-col-2xl-2"
          >
            <SimplifionsRecoSolutionsIntegratricesCard
              :solution="solution"
              :integration-score="integrationScorePerSolution.get(solution.id)"
              :nom-fournisseur="recommandation.Nom_de_la_recommandation"
              :type-label="typeLabel"
            />
          </div>
        </div>
      </DsfrAccordion>
    </DsfrAccordionsGroup>

    <DsfrAccordionsGroup
      v-model="activeLogicielsAccordion"
      :class="{ 'accordion-empty': !integratingSolutionsLogicielsMetiers.length }"
    >
      <DsfrAccordion title-tag="h6">
        <template #title>Via un logiciel métier « clé en main »</template>
        <p>
          <strong>Liste des logiciels métier, sur étagère</strong> conçus pour
          le cas d'usage «<i
            >&nbsp;{{ recommandation.Nom_complet_du_cas_d_usage }}&nbsp;</i
          >» :
        </p>
        <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
          <div
            v-for="solution in integratingSolutionsLogicielsMetiers"
            :key="solution.id"
            class="fr-col-12 fr-col-sm-6 fr-col-lg-4 fr-col-xl-3 fr-col-2xl-2"
          >
            <SimplifionsRecoSolutionsIntegratricesCard
              :solution="solution"
              :integration-score="integrationScorePerSolution.get(solution.id)"
              :nom-fournisseur="recommandation.Nom_de_la_recommandation"
              :type-label="typeLabel"
            />
          </div>
        </div>
      </DsfrAccordion>
    </DsfrAccordionsGroup>

    <DsfrAccordionsGroup
      v-model="activePortailsAccordion"
      :class="{ 'accordion-empty': !integratingSolutionsPortailsConsultation.length }"
    >
      <DsfrAccordion title-tag="h6">
        <template #title>Via un portail de consultation</template>
        <p>
          <b
            >Ces sites vous permettent de consulter certaines des données utiles
            pour ce cas d'usage :</b
          >
        </p>
        <div class="fr-m-2w fr-highlight--orange-terre-battue fr-highlight">
          <p class="fr-mb-0">
            💡 Pour vraiment simplifier la vie des usagers, l'intégration
            directe de cette API ou de jeu de données dans vos logiciels métiers
            est à privilégier car elle permet de mettre en oeuvre le
            <i>dites-le-nous une fois</i> et la proactivité !
          </p>
        </div>
        <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
          <div
            v-for="solution in integratingSolutionsPortailsConsultation"
            :key="solution.id"
            class="fr-col-12 fr-col-sm-6 fr-col-lg-4 fr-col-xl-3 fr-col-2xl-2"
          >
            <SimplifionsRecoSolutionsIntegratricesCard
              :solution="solution"
              :integration-score="integrationScorePerSolution.get(solution.id)"
              :nom-fournisseur="recommandation.Nom_de_la_recommandation"
              :type-label="typeLabel"
            />
          </div>
        </div>
      </DsfrAccordion>
    </DsfrAccordionsGroup>

    <p class="fr-text--sm fr-mx-2w fr-mt-2w">
      <i
        >Une solution intégrant
        «&nbsp;{{ recommandation.Nom_de_la_recommandation }}&nbsp;», n'est pas listée ?
      </i>
      <a href="#modification-contenu">✒️ Proposez-nous de l'ajouter</a>.
    </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import { grist } from '../grist.ts'
import type {
  ApiOrDataset,
  ApiOrDatasetRecord,
  ApiOrDatasetUtiles,
  ApiOrDatasetUtilesRecord,
  Recommandation,
  SolutionRecord
} from '../model/grist'
import TopicsAPI from '../simplifionsTopicsApi'
import SimplifionsDataApi from './SimplifionsDataApi.vue'
import SimplifionsRecoSolutionsIntegratricesCard from './SimplifionsRecoSolutionsIntegratricesCard.vue'

const props = defineProps<{
  recommandation: Recommandation
}>()

const recommandation = props.recommandation
const isSolution = !!recommandation.Solution_recommandee

// === Solution-specific ===
const topicSlug = ref<string | undefined>(undefined)
const usefulDataApiFourniesParLaSolution = ref<ApiOrDatasetRecord[] | undefined>(undefined)
const customDescriptions = ref<Record<number, ApiOrDatasetUtiles>>({})
const searchId = useId()
const searchQuery = ref('')
const currentPage = ref(0)
const tableWrapperRef = ref<HTMLElement | null>(null)
const tableBodyRef = ref<HTMLElement | null>(null)
const pageBreaks = ref<number[]>([0])
const isMeasuring = ref(false)
const usableHeight = ref(0)

const updateRowHeight = () => {
  if (!tableWrapperRef.value || !usableHeight.value) return
  const rowsOnPage = paginatedEndpoints.value.length
  if (!rowsOnPage) {
    tableWrapperRef.value.style.removeProperty('--row-height')
    return
  }
  const rowH = usableHeight.value / rowsOnPage
  tableWrapperRef.value.style.setProperty('--row-height', `${rowH}px`)
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await nextTick()
  updateRowHeight()
}

const recomputePageBreaks = async () => {
  const wrapper = tableWrapperRef.value
  if (!wrapper || !filteredEndpoints.value.length) return

  isMeasuring.value = true
  await nextTick()

  // Remove height constraint to measure natural row heights
  wrapper.style.removeProperty('--row-height')

  const theadHeight = tableBodyRef.value?.closest('table')?.querySelector('thead')?.offsetHeight ?? 0
  // clientHeight excludes wrapper borders (1px × 2 = 2px)
  usableHeight.value = wrapper.clientHeight - theadHeight

  const rows = [...(tableBodyRef.value?.querySelectorAll('tr') ?? [])]
  const breaks = [0]
  let pageStart = 0
  let maxH = 0

  for (let i = 0; i < rows.length; i++) {
    const h = (rows[i] as HTMLElement).offsetHeight
    const rowsAfterAdd = i - pageStart + 1
    const newMax = Math.max(maxH, h)

    // Invariant: rowsAfterAdd × max(heights) ≤ usableHeight
    // Ensures no row overflows after uniform stretching to usableHeight/n
    if (rowsAfterAdd > 1 && rowsAfterAdd * newMax > usableHeight.value) {
      breaks.push(i)
      pageStart = i
      maxH = h
    } else {
      maxH = newMax
    }
  }

  pageBreaks.value = breaks
  isMeasuring.value = false
  await nextTick()
  updateRowHeight()
}

let resizeTimer: ReturnType<typeof setTimeout> | undefined
const debouncedRecomputePageBreaks = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(recomputePageBreaks, 150)
}

onMounted(() => window.addEventListener('resize', debouncedRecomputePageBreaks))
onUnmounted(() => {
  window.removeEventListener('resize', debouncedRecomputePageBreaks)
  clearTimeout(resizeTimer)
})

const filteredEndpoints = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedUsefulEndpoints.value ?? []
  return (sortedUsefulEndpoints.value ?? []).filter((record) => {
    const description = customDescriptions.value[record.id]?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage ?? ''
    return (
      record.fields.Nom.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q)
    )
  })
})

const paginatedEndpoints = computed(() => {
  const start = pageBreaks.value[currentPage.value] ?? 0
  const end = pageBreaks.value[currentPage.value + 1] ?? filteredEndpoints.value.length
  return filteredEndpoints.value.slice(start, end)
})

const paginationPages = computed(() =>
  pageBreaks.value.map((_, i) => ({
    label: String(i + 1),
    title: `Page ${i + 1}`,
    href: '#'
  }))
)

const displayedEndpoints = computed(() =>
  isMeasuring.value ? filteredEndpoints.value : paginatedEndpoints.value
)

if (isSolution) {
  const topicsAPI = new TopicsAPI({ version: 2 })
  const solutionTag = `simplifions-v2-solutions-${recommandation.Solution_recommandee}`
  topicsAPI.getTopicByTag(solutionTag).then((topic) => {
    topicSlug.value = topic?.slug
  })

  if (recommandation.API_et_datasets_utiles_fournis?.length) {
    grist
      .getRecordsByIds('APIs_et_datasets', recommandation.API_et_datasets_utiles_fournis)
      .then((data) => {
        usefulDataApiFourniesParLaSolution.value = (data as ApiOrDatasetRecord[]).filter(
          (record) => record.fields.Visible_sur_simplifions
        )

        if (recommandation.Descriptions_des_API_et_datasets_utiles_fournis?.length) {
          grist
            .getRecordsByIds(
              'API_et_datasets_utiles',
              recommandation.Descriptions_des_API_et_datasets_utiles_fournis
            )
            .then((data) => {
              const apidata_utiles = data as ApiOrDatasetUtilesRecord[]
              apidata_utiles.forEach((record) => {
                customDescriptions.value[
                  record.fields.Api_ou_dataset_utile_fourni_par_une_recommandation
                ] = record.fields
              })
            })
        }
      })
  } else {
    usefulDataApiFourniesParLaSolution.value = []
  }
}

const sortedUsefulEndpoints = computed(() => {
  return usefulDataApiFourniesParLaSolution.value?.slice().sort((a, b) => {
    const aCustomDescription = customDescriptions.value[a.id]
    const bCustomDescription = customDescriptions.value[b.id]

    const aOrdre =
      typeof aCustomDescription?.Ordre === 'number' ? aCustomDescription.Ordre : Infinity
    const bOrdre =
      typeof bCustomDescription?.Ordre === 'number' ? bCustomDescription.Ordre : Infinity

    if (aOrdre !== bOrdre) return aOrdre - bOrdre

    const aDescriptionLength =
      aCustomDescription
        ?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage?.length || 0
    const bDescriptionLength =
      bCustomDescription
        ?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage?.length || 0
    const lengthDiff = bDescriptionLength - aDescriptionLength
    if (lengthDiff !== 0) return lengthDiff

    return a.fields.Nom.localeCompare(b.fields.Nom)
  })
})

watch(filteredEndpoints, () => {
  currentPage.value = 0
  if (activeApiAccordion.value === 0) recomputePageBreaks()
})

// === API/dataset-specific ===
const apiOrDataset = ref<ApiOrDataset | undefined>(undefined)
const fetchedResource = ref<DatasetV2 | Dataservice | undefined>(undefined)

if (!isSolution) {
  grist
    .getRecord('APIs_et_datasets', recommandation.API_ou_datasets_recommandes)
    .then((data) => {
      apiOrDataset.value = data.fields as ApiOrDataset
    })
}

const handleResourceFetched = (resource: DatasetV2 | Dataservice) => {
  fetchedResource.value = resource
}

const access_url = computed(() => {
  if (recommandation.access_link_with_fallback) return recommandation.access_link_with_fallback
  if (fetchedResource.value && 'authorization_request_url' in fetchedResource.value) {
    return (fetchedResource.value as Dataservice).authorization_request_url
  }
  return undefined
})

const accessTypeLabel = computed(() => {
  const t = recommandation.Type_de_recommandation
  if (t === 'API') return 'cette API'
  if (t === 'Jeu de données') return 'ce jeu de données'
  return 'cette API ou ce jeu de données'
})

// === Shared ===
const typeLabel = computed(() => {
  const t = recommandation.Type_de_recommandation
  if (t === 'API') return 'API'
  if (t === 'Jeu de données') return 'jeu de données'
  return 'API ou jeu de données'
})

const datagouvUrlType = (apiOrDataset: ApiOrDataset) => {
  switch (apiOrDataset.Type) {
    case 'API': return 'dataservices'
    case 'Jeu de données': return 'datasets'
    default: throw new Error(`Unknown type: ${apiOrDataset.Type}`)
  }
}

const fetchSolutionsForCategory = async (ids: number[]) => {
  const data = await grist.getRecordsByIds('Solutions', ids)
  return (data as SolutionRecord[])
    .filter((record) => record.fields.Visible_sur_simplifions)
    .sort((a, b) =>
      a.fields.Nom.localeCompare(b.fields.Nom, 'fr', { sensitivity: 'base' })
    )
}

const integratingSolutionsLogicielsMetiers = ref<SolutionRecord[]>([])
const integratingSolutionsBriquesTechniques = ref<SolutionRecord[]>([])
const integratingSolutionsPortailsConsultation = ref<SolutionRecord[]>([])

if (recommandation.Solutions_integratrices_categorie_logiciel_metier?.length) {
  fetchSolutionsForCategory(
    recommandation.Solutions_integratrices_categorie_logiciel_metier
  ).then((solutions) => {
    integratingSolutionsLogicielsMetiers.value = solutions
  })
}

if (recommandation.Solutions_integratrices_categorie_briques_techniques?.length) {
  fetchSolutionsForCategory(
    recommandation.Solutions_integratrices_categorie_briques_techniques
  ).then((solutions) => {
    integratingSolutionsBriquesTechniques.value = solutions
  })
}

if (recommandation.Solutions_integratrices_categorie_portail_de_consultation?.length) {
  fetchSolutionsForCategory(
    recommandation.Solutions_integratrices_categorie_portail_de_consultation
  ).then((solutions) => {
    integratingSolutionsPortailsConsultation.value = solutions
  })
}

const usefulApiIds = new Set(recommandation.API_et_datasets_utiles_fournis ?? [])

const integrationScorePerSolution = computed(() => {
  const allSolutions = [
    ...integratingSolutionsLogicielsMetiers.value,
    ...integratingSolutionsBriquesTechniques.value,
    ...integratingSolutionsPortailsConsultation.value
  ]
  if (isSolution) {
    const totalCount = usefulApiIds.size
    return new Map(
      allSolutions.map((solution) => [
        solution.id,
        {
          integratedCount: (solution.fields.API_ou_datasets_integres ?? []).filter((id) =>
            usefulApiIds.has(id)
          ).length,
          totalCount
        }
      ])
    )
  } else {
    const usefulApiId = recommandation.API_ou_datasets_recommandes
    return new Map(
      allSolutions.map((solution) => [
        solution.id,
        {
          integratedCount: (solution.fields.API_ou_datasets_integres ?? []).includes(usefulApiId)
            ? 1
            : 0,
          totalCount: 1
        }
      ])
    )
  }
})

const activeApiAccordion = ref(-1)
const activeBriquesAccordion = ref(-1)
const activeLogicielsAccordion = ref(-1)
const activePortailsAccordion = ref(-1)

const ACCORDION_TRANSITION_MS = 350 // DsfrAccordion animation duration

watch(activeApiAccordion, (val) => {
  if (val === 0) setTimeout(recomputePageBreaks, ACCORDION_TRANSITION_MS)
})
</script>

<style scoped>

.fr-table .fr-table__wrapper {
  border: 1px solid var(--border-default-grey);
  height: calc(100vh - 13rem);
  overflow: hidden;
}

.fr-table .fr-table__wrapper tbody tr {
  height: var(--row-height, auto);
}

.fr-table__header .fr-search-bar {
  min-width: 28rem;
}

.reco-card {
  background-color: var(--background-alt-beige-gris-galet);
  border-radius: 4px;
}

.icon-green {
  color: #27a658;
}

.icon-black {
  color: var(--text-title-grey);
}

:deep(.fr-accordion__btn[aria-expanded='true']) {
  background-color: var(--background-alt-blue-france);
  color: var(--text-action-high-blue-france);
}

.accordion-empty :deep(.fr-accordion__btn) {
  color: var(--text-disabled-grey);
  pointer-events: none;
  cursor: not-allowed;
}

.accordion-empty :deep(.fr-accordion__btn::after) {
  color: var(--text-disabled-grey);
}

.fr-text--sm :deep(p) {
  font-size: inherit;
  line-height: inherit;
}
</style>

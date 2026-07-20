<template>
  <div class="reco-data-api-card fr-p-2w fr-mb-4w">
    <div class="fr-grid-row">
      <h4 class="fr-h4 fr-mb-2w fr-col-md fr-col-12">
        ➡️ {{ recommandation.Nom_de_la_recommandation }}
      </h4>

      <div v-if="access_url">
        <a
          rel="noopener noreferrer"
          :href="access_url"
          class="fr-btn access-link"
          target="_blank"
        >
          Demande d'accès
        </a>
      </div>
    </div>

    <div
      class="fr-grid-row fr-grid-row--gutters fr-mb-2w fr-grid-row--top fr-mx-2w"
    >
      <div
        v-if="recommandation.Donnees_utiles_disponibles"
        class="api-or-dataset-description fr-mt-2w fr-mb-2w fr-col-12 fr-col-md-6"
      >
        <div class="reco-text-column">
          <div>
            <h5 class="fr-text--md">
              <span aria-hidden="true" class="fr-icon-success-fill icon-green">
              </span>
              Données disponibles :
            </h5>
          </div>
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="fr-ml-3w"
            v-html="
              fromMarkdown(recommandation.Donnees_utiles_disponibles).html
            "
          ></div>
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </div>

      <div
        v-if="recommandation.Parametres_a_saisir_pour_recuperer_les_donnees"
        class="api-or-dataset-description fr-px-2w fr-mt-2w fr-mb-2w fr-col-12 fr-col-md-6"
      >
        <div class="reco-text-column">
          <div>
            <h5 class="fr-text--md">
              <span aria-hidden="true">✍️</span>
              Informations à saisir pour récupérer la donnée :
            </h5>
          </div>
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="fr-ml-3w"
            v-html="
              fromMarkdown(
                recommandation.Parametres_a_saisir_pour_recuperer_les_donnees
              ).html
            "
          ></div>
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </div>
    </div>

    <SimplifionsDataApi
      v-if="apiOrDataset"
      :api-or-dataset="apiOrDataset"
      title-tag="h5"
      @resource-fetched="handleResourceFetched"
    />

    <div v-if="hasIntegratingSolutions" class="fr-col-12 fr-p-0 fr-mt-4w">
      <DsfrAccordionsGroup v-model="activeIntegratingAccordion">
        <DsfrAccordion title-tag="h5">
          <template #title>
            <strong
              >Solutions intégrant «&nbsp;{{
                recommandation.Nom_de_la_recommandation
              }}&nbsp;»</strong
            >
          </template>
          <DsfrTabs
            v-model="activeTab"
            tab-list-name="Catégories de solutions intégratrices"
            :tab-titles="tabTitles"
          >
            <DsfrTabContent
              v-if="integratingSolutionsLogicielsMetiers?.length"
              :panel-id="`${uid}-tab-content-logiciel-metier`"
              :tab-id="`${uid}-tab-logiciel-metier`"
              style="background-color: white"
            >
              <p>
                <strong>Liste des logiciels métier, sur étagère</strong>
                conçus pour le cas d'usage «<i
                  >&nbsp;{{
                    recommandation.Nom_complet_du_cas_d_usage
                  }}&nbsp;</i
                >» :
              </p>
              <div
                class="reco-solution fr-grid-row fr-grid-row--gutters fr-mt-2w"
              >
                <div
                  v-for="solution in integratingSolutionsLogicielsMetiers"
                  :key="solution.id"
                  class="fr-col-12 fr-col-sm-6 fr-col-lg-4 fr-col-xl-3 fr-col-2xl-2"
                >
                  <SimplifionsRecoSolutionsIntegratricesCard
                    :solution="solution"
                    :integration-score="
                      integrationScorePerSolution.get(solution.id)
                    "
                    :nom-fournisseur="recommandation.Nom_de_la_recommandation"
                    :type-label="typeLabel"
                  />
                </div>
              </div>
            </DsfrTabContent>

            <DsfrTabContent
              v-if="integratingSolutionsBriquesTechniques?.length"
              :panel-id="`${uid}-tab-content-brique-technique`"
              :tab-id="`${uid}-tab-brique-technique`"
              style="background-color: white"
            >
              <p>
                <strong>Briques techniques logicielles</strong> destinées à être
                intégrées dans un système informatique existant et conçues pour
                le cas d'usage «<i
                  >&nbsp;{{
                    recommandation.Nom_complet_du_cas_d_usage
                  }}&nbsp;</i
                >» :
              </p>
              <div
                class="reco-solution fr-grid-row fr-grid-row--gutters fr-mt-2w"
              >
                <div
                  v-for="solution in integratingSolutionsBriquesTechniques"
                  :key="solution.id"
                  class="fr-col-12 fr-col-sm-6 fr-col-lg-4 fr-col-xl-3 fr-col-2xl-2"
                >
                  <SimplifionsRecoSolutionsIntegratricesCard
                    :solution="solution"
                    :integration-score="
                      integrationScorePerSolution.get(solution.id)
                    "
                    :nom-fournisseur="recommandation.Nom_de_la_recommandation"
                    :type-label="typeLabel"
                  />
                </div>
              </div>
            </DsfrTabContent>

            <DsfrTabContent
              v-if="integratingSolutionsPortailsConsultation?.length"
              :panel-id="`${uid}-tab-content-portail-consultation`"
              :tab-id="`${uid}-tab-portail-consultation`"
              style="background-color: white"
            >
              <p>
                <b
                  >Ces sites vous permettent de consulter certaines des données
                  utiles pour ce cas d'usage :</b
                >
              </p>
              <div
                class="fr-m-2w fr-highlight--orange-terre-battue fr-highlight"
              >
                <p class="fr-mb-0">
                  💡 Pour vraiment simplifier la vie des usagers, l'intégration
                  directe de cette API ou de jeu de données dans vos logiciels
                  métiers est à privilégier car elle permet de mettre en oeuvre
                  le <i>dites-le-nous une fois</i> et la proactivité !
                </p>
              </div>
              <div
                class="reco-solution fr-grid-row fr-grid-row--gutters fr-mt-2w"
              >
                <div
                  v-for="solution in integratingSolutionsPortailsConsultation"
                  :key="solution.id"
                  class="fr-col-12 fr-col-sm-6 fr-col-lg-4 fr-col-xl-3 fr-col-2xl-2"
                >
                  <SimplifionsRecoSolutionsIntegratricesCard
                    :solution="solution"
                    :integration-score="
                      integrationScorePerSolution.get(solution.id)
                    "
                    :nom-fournisseur="recommandation.Nom_de_la_recommandation"
                    :type-label="typeLabel"
                  />
                </div>
              </div>
            </DsfrTabContent>
          </DsfrTabs>
          <p class="fr-text--sm fr-mx-3w fr-mt-2w">
            <i
              >Une solution n'est pas listée parmi les solutions intégrant
              «&nbsp;{{ recommandation.Nom_de_la_recommandation }}&nbsp;» ?
            </i>
            <a href="#modification-contenu">✒️ Proposer un contenu</a>.
          </p>
        </DsfrAccordion>
      </DsfrAccordionsGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import { grist } from '../grist.ts'
import type {
  ApiOrDataset,
  Recommandation,
  SolutionRecord
} from '../model/grist'
import SimplifionsDataApi from './SimplifionsDataApi.vue'
import SimplifionsRecoSolutionsIntegratricesCard from './SimplifionsRecoSolutionsIntegratricesCard.vue'

const props = defineProps<{
  recommandation: Recommandation
}>()

const uid = useId()

const apiOrDataset = ref<ApiOrDataset | undefined>(undefined)
const fetchedResource = ref<DatasetV2 | Dataservice | undefined>(undefined)

const access_url = computed(() => {
  // Prioritize the URL from the recommandation
  if (props.recommandation.access_link_with_fallback) {
    return props.recommandation.access_link_with_fallback
  }
  // Fall back to the authorization_request_url from the fetched dataservice
  // (authorization_request_url only exists on dataservices, not datasets)
  if (
    fetchedResource.value &&
    'authorization_request_url' in fetchedResource.value
  ) {
    return (fetchedResource.value as Dataservice).authorization_request_url
  }
  return undefined
})

const handleResourceFetched = (resource: DatasetV2 | Dataservice) => {
  fetchedResource.value = resource
}

grist
  .getRecord(
    'APIs_et_datasets',
    props.recommandation.API_ou_datasets_recommandes
  )
  .then((data) => {
    apiOrDataset.value = data.fields as ApiOrDataset
  })

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

if (
  props.recommandation.Solutions_integratrices_categorie_logiciel_metier?.length
) {
  fetchSolutionsForCategory(
    props.recommandation.Solutions_integratrices_categorie_logiciel_metier
  ).then((solutions) => {
    integratingSolutionsLogicielsMetiers.value = solutions
  })
}

if (
  props.recommandation.Solutions_integratrices_categorie_briques_techniques
    ?.length
) {
  fetchSolutionsForCategory(
    props.recommandation.Solutions_integratrices_categorie_briques_techniques
  ).then((solutions) => {
    integratingSolutionsBriquesTechniques.value = solutions
  })
}

if (
  props.recommandation.Solutions_integratrices_categorie_portail_de_consultation
    ?.length
) {
  fetchSolutionsForCategory(
    props.recommandation
      .Solutions_integratrices_categorie_portail_de_consultation
  ).then((solutions) => {
    integratingSolutionsPortailsConsultation.value = solutions
  })
}

const usefulApiId = props.recommandation.API_ou_datasets_recommandes

const integrationScorePerSolution = computed(() => {
  const allSolutions = [
    ...integratingSolutionsLogicielsMetiers.value,
    ...integratingSolutionsBriquesTechniques.value,
    ...integratingSolutionsPortailsConsultation.value
  ]
  return new Map(
    allSolutions.map((solution) => [
      solution.id,
      {
        integratedCount: (
          solution.fields.API_ou_datasets_integres ?? []
        ).includes(usefulApiId)
          ? 1
          : 0,
        totalCount: 1
      }
    ])
  )
})

const typeLabel = computed(() => {
  const t = props.recommandation.Type_de_recommandation
  if (t === 'API') return 'API'
  if (t === 'Jeu de données') return 'jeu de données'
  return 'API ou jeu de données'
})

const activeIntegratingAccordion = ref(0)
const activeTab = ref(0)
const tabTitles = computed(() => {
  const titles = []
  if (integratingSolutionsLogicielsMetiers.value.length > 0) {
    const count = integratingSolutionsLogicielsMetiers.value.length
    titles.push({
      title: `Logiciels métiers (${count}) 💠💠💠`,
      tabId: `${uid}-tab-logiciel-metier`,
      panelId: `${uid}-tab-content-logiciel-metier`
    })
  }
  if (integratingSolutionsBriquesTechniques.value.length > 0) {
    const count = integratingSolutionsBriquesTechniques.value.length
    titles.push({
      title: `Briques techniques (${count}) 💠💠💠`,
      tabId: `${uid}-tab-brique-technique`,
      panelId: `${uid}-tab-content-brique-technique`
    })
  }
  if (integratingSolutionsPortailsConsultation.value.length > 0) {
    const count = integratingSolutionsPortailsConsultation.value.length
    titles.push({
      title: `Portails de consultation (${count})`,
      tabId: `${uid}-tab-portail-consultation`,
      panelId: `${uid}-tab-content-portail-consultation`
    })
  }
  return titles
})

watch(tabTitles, () => {
  activeTab.value = 0
})

const hasIntegratingSolutions = computed(() => tabTitles.value.length > 0)
</script>

<style scoped>
.reco-data-api-card {
  background-color: var(--background-alt-beige-gris-galet);
  border-radius: 4px;
}

.icon-green {
  color: #27a658;
}

.icon-red {
  color: #ff292f;
}
</style>

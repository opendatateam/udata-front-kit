<template>
  <div class="reco-solution fr-p-2w fr-mb-4w">
    <div class="fr-grid-row">
      <h4 class="fr-h4 fr-mb-2w fr-col-md fr-col-12">
        ➡️ {{ recommandation.Nom_de_la_recommandation }}
      </h4>
      <div v-if="recommandation.access_link_with_fallback">
        <a
          rel="noopener noreferrer"
          :href="recommandation.access_link_with_fallback"
          class="fr-btn access-link"
          target="_blank"
        >
          Demande d'accès
        </a>
      </div>
    </div>

    <div
      class="fr-grid-row fr-grid-row--gutters fr-mt-4w fr-mb-2w fr-mx-2w fr-grid-row--top"
    >
      <div class="fr-col-12 fr-col-md-8 fr-col-lg-3">
        <div class="fr-tile fr-tile--sm fr-tile--vertical fr-enlarge-link">
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <p class="fr-tile__title fr-text--lead">
                <router-link
                  v-if="topicSlug"
                  class="solution-link"
                  :to="{
                    name: 'solutions_detail',
                    params: { item_id: topicSlug }
                  }"
                >
                  {{ recommandation.Nom_de_la_recommandation }}
                </router-link>
                <br />
                {{
                  topicSlug
                    ? 'En savoir plus'
                    : 'Chargement du lien en cours...'
                }}
              </p>
            </div>
          </div>
          <div class="fr-tile__header">
            <img
              v-if="recommandation.Image?.length"
              :src="grist.imageUrl(recommandation.Image[0])"
              class="fr-responsive-img fr-ratio-16x9"
            />
          </div>
        </div>
      </div>

      <div v-if="hasContent" class="fr-col-12 fr-col-lg-8 fr-ml-2w">
        <div
          v-if="
            recommandation.Donnees_utiles_disponibles
          "
          class="reco-section fr-mb-2w"
        >
          <div class="fr-mr-1w bullet-icon">
            <span
              aria-hidden="true"
              class="fr-icon-success-fill icon-green"
            ></span>
          </div>

          <div class="reco-text-column">
            <div>
              <h5 class="fr-text--md">
                Données disponibles :
              </h5>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(
                  recommandation.Donnees_utiles_disponibles
                )
              "
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

        <div
          v-if="recommandation.Parametres_a_saisir_pour_recuperer_les_donnees"
          class="reco-section fr-mb-2w"
        >
          <div class="fr-mr-1w bullet-icon">
            <span aria-hidden="true">✍️</span>
          </div>

          <div class="reco-text-column">
            <div>
               <h5 class="fr-text--md"> Informations à saisir pour récupérer la donnée :</h5>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(recommandation.Parametres_a_saisir_pour_recuperer_les_donnees)
              "
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

      </div>
      <p v-else class="fr-text--sm ">
        <i>Aucun contenu actuellement.</i>
        <a href="#modification-contenu">✒️ Proposer un contenu</a>.
      </p>

      <div
        v-if="recommandation.API_et_datasets_utiles_fournis?.length"
        class="fr-col-12 fr-p-0 fr-mt-4w"
      >
        <DsfrAccordion  title-tag="h5">
          <template #title>
            <strong>API et données utiles</strong>, fournies par la solution
          </template>
          <div v-if="usefulDataApiFourniesParLaSolution === undefined">
            Chargement des données en cours...
          </div>
          <ul v-else>
            <li
              v-for="apidOrDataset in sortedUsefulDataApiFourniesParLaSolution"
              :key="apidOrDataset.fields.UID_datagouv"
            >
              <SimplifionsDataApiUtile
                :api-or-dataset="apidOrDataset.fields"
                :custom-description="
                  customDescriptions[apidOrDataset.id]
                    ?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage
                "
              />
            </li>
          </ul>
        </DsfrAccordion>
      </div>

      <div
        v-if="hasIntegratingSolutions"
        class="fr-col-12 fr-p-0"
      >   
        <DsfrAccordionsGroup v-model="activeIntegratingAccordion">
          <DsfrAccordion title-tag="h5">
            <template #title>
              <strong>Solutions intégrant «&nbsp;{{ recommandation.Nom_de_la_recommandation }}&nbsp;»</strong>
            </template>
            <DsfrTabs
              v-model="activeTab"
              tab-list-name="Catégories de solutions intégratrices"
              :tab-titles="tabTitles"
            >
              <DsfrTabContent
                v-if="integratingSolutionsLogicielsMetiers?.length"
                panel-id="tab-content-logiciel-metier"
                tab-id="tab-logiciel-metier"
              >
                <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
                  <div
                    v-for="solution in integratingSolutionsLogicielsMetiers"
                    :key="solution.id"
                    class="fr-col-12 fr-col-sm-6 fr-col-md-4 fr-col-lg-3 fr-col-xl-2"
                  >
                    <SimplifionsRecoSolutionsIntegratricesCard :solution="solution" />
                  </div>
                </div>
              </DsfrTabContent>

              <DsfrTabContent
                v-if="integratingSolutionsBriquesTechniques?.length"
                panel-id="tab-content-brique-technique"
                tab-id="tab-brique-technique"
              >
                <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
                  <div
                    v-for="solution in integratingSolutionsBriquesTechniques"
                    :key="solution.id"
                    class="fr-col-12 fr-col-sm-6 fr-col-md-4 fr-col-lg-3 fr-col-xl-2"
                  >
                    <SimplifionsRecoSolutionsIntegratricesCard :solution="solution" />
                  </div>
                </div>
              </DsfrTabContent>

              <DsfrTabContent
                v-if="integratingSolutionsPortailsConsultation?.length"
                panel-id="tab-content-portail-consultation"
                tab-id="tab-portail-consultation"
              >
                <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
                  <div
                    v-for="solution in integratingSolutionsPortailsConsultation"
                    :key="solution.id"
                    class="fr-col-12 fr-col-sm-6 fr-col-md-4 fr-col-lg-3 fr-col-xl-2"
                  >
                    <SimplifionsRecoSolutionsIntegratricesCard :solution="solution" />
                  </div>
                </div>
              </DsfrTabContent>
            </DsfrTabs>
          </DsfrAccordion>
        </DsfrAccordionsGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import { grist } from '../grist.ts'
import type {
  ApiOrDatasetRecord,
  ApiOrDatasetUtiles,
  ApiOrDatasetUtilesRecord,
  Recommandation,
  SolutionRecord
} from '../model/grist'
import TopicsAPI from '../simplifionsTopicsApi'
import SimplifionsRecoSolutionsIntegratricesCard from './SimplifionsRecoSolutionsIntegratricesCard.vue'

const props = defineProps<{
  recommandation: Recommandation
}>()

const recommandation = props.recommandation

const hasContent = computed(() => {
  return (
    recommandation.Donnees_utiles_disponibles ||
    recommandation.Parametres_a_saisir_pour_recuperer_les_donnees
  )
})

const topicsAPI = new TopicsAPI({ version: 2 })
const solutionTag = `simplifions-v2-solutions-${recommandation.Solution_recommandee}`
const topicSlug = ref<string | undefined>(undefined)
topicsAPI.getTopicByTag(solutionTag).then((topic) => {
  topicSlug.value = topic?.slug
})

const usefulDataApiFourniesParLaSolution = ref<
  ApiOrDatasetRecord[] | undefined
>(undefined)
const customDescriptions = ref<Record<number, ApiOrDatasetUtiles>>({})

const sortedUsefulDataApiFourniesParLaSolution = computed(() => {
  return usefulDataApiFourniesParLaSolution.value?.sort((a, b) => {
    const aCustomDescription = customDescriptions.value[a.id]
    const bCustomDescription = customDescriptions.value[b.id]

    // First sort by ordre (lowest first) - items with ordre come first
    const aOrdre =
      typeof aCustomDescription?.Ordre === 'number'
        ? aCustomDescription.Ordre
        : Infinity
    const bOrdre =
      typeof bCustomDescription?.Ordre === 'number'
        ? bCustomDescription.Ordre
        : Infinity

    if (aOrdre !== bOrdre) return aOrdre - bOrdre

    // Then sort by custom description length (longest first)
    const aDescriptionLength =
      aCustomDescription
        ?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage?.length ||
      0
    const bDescriptionLength =
      bCustomDescription
        ?.En_quoi_cette_API_ou_dataset_est_utile_pour_ce_cas_d_usage?.length ||
      0
    const lengthDiff = bDescriptionLength - aDescriptionLength
    if (lengthDiff !== 0) return lengthDiff

    // Finally sort by name
    return a.fields.Nom.localeCompare(b.fields.Nom)
  })
})

if (recommandation.API_et_datasets_utiles_fournis?.length) {
  grist
    .getRecordsByIds(
      'APIs_et_datasets',
      recommandation.API_et_datasets_utiles_fournis
    )
    .then((data) => {
      usefulDataApiFourniesParLaSolution.value = (
        data as ApiOrDatasetRecord[]
      ).filter((record) => record.fields.Visible_sur_simplifions)

      if (
        recommandation.Descriptions_des_API_et_datasets_utiles_fournis?.length
      ) {
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
}

const fetchSolutionsForCategory = async (ids: number[]) => {
  const data = await grist.getRecordsByIds('Solutions', ids)
  return (data as SolutionRecord[]).filter(
    (record) => record.fields.Visible_sur_simplifions
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

if (
  recommandation.Solutions_integratrices_categorie_briques_techniques?.length
) {
  fetchSolutionsForCategory(
    recommandation.Solutions_integratrices_categorie_briques_techniques
  ).then((solutions) => {
    integratingSolutionsBriquesTechniques.value = solutions
  })
}

if (
  recommandation.Solutions_integratrices_categorie_portail_de_consultation?.length
) {
  fetchSolutionsForCategory(
    recommandation.Solutions_integratrices_categorie_portail_de_consultation
  ).then((solutions) => {
    integratingSolutionsPortailsConsultation.value = solutions
  })
}

const activeIntegratingAccordion = ref(0)
const activeTab = ref(0)
const tabTitles = computed(() => {
  const titles = []
  if (integratingSolutionsLogicielsMetiers.value.length > 0) {
    titles.push({
      title: 'Logiciels métiers 💠💠💠',
      tabId: 'tab-logiciel-metier',
      panelId: 'tab-content-logiciel-metier'
    })
  }
  if (integratingSolutionsBriquesTechniques.value.length > 0) {
    titles.push({
      title: 'Briques techniques 💠💠💠',
      tabId: 'tab-brique-technique',
      panelId: 'tab-content-brique-technique'
    })
  }
  if (integratingSolutionsPortailsConsultation.value.length > 0) {
    titles.push({
      title: 'Portails de consultation',
      tabId: 'tab-portail-consultation',
      panelId: 'tab-content-portail-consultation'
    })
  }
  return titles
})

const hasIntegratingSolutions = computed(() => tabTitles.value.length > 0)
</script>

<style scoped>
.bullet-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reco-solution {
  background-color: var(--background-alt-beige-gris-galet);
  /* padding: 15px; */
  border-radius: 4px;
}

.icon-green {
  color: #27a658;
}

.icon-red {
  color: #ff292f;
}

.reco-section {
  display: flex;
}

:deep(.fr-accordion__btn[aria-expanded='true']) {
  background-color: var(--background-alt-blue-france);
  color: #3558a2;
}
</style>

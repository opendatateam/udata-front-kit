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
            recommandation.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage
          "
          class="reco-section"
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
                En quoi cette solution est utile pour ce cas d'usage ?
              </h5>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(
                  recommandation.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage
                )
              "
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

        <div
          v-if="recommandation.Concretement_pour_les_usagers"
          class="reco-section"
        >
          <div class="fr-mr-1w bullet-icon">
            <span aria-hidden="true">🧑</span>
          </div>

          <div class="reco-text-column">
            <div>
              <h5 class="fr-text--md">Concrètement, pour les usagers :</h5>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(recommandation.Concretement_pour_les_usagers)
              "
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

        <div
          v-if="recommandation.Concretement_pour_vos_agents"
          class="reco-section"
        >
          <div class="fr-mr-1w bullet-icon">
            <span aria-hidden="true">🧑‍💼</span>
          </div>

          <div class="reco-text-column">
            <div>
              <h5 class="fr-text--md">Concrètement, pour vos agents :</h5>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="fromMarkdown(recommandation.Concretement_pour_vos_agents)"
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

        <div
          v-if="recommandation.Ce_que_ne_fait_pas_cette_solution"
          class="reco-section"
        >
          <div class="fr-mr-1w bullet-icon">
            <span aria-hidden="true" class="fr-icon-error-fill icon-red"></span>
          </div>

          <div class="reco-text-column">
            <div>
              <h5 class="fr-text--md">Ce que ne fait pas cette solution :</h5>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(recommandation.Ce_que_ne_fait_pas_cette_solution)
              "
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </div>
      <p v-else class="fr-text--sm">
        <i>Aucun contenu actuellement.</i>
        <a href="#modification-contenu">✍️ Proposer un contenu</a>.
      </p>

      <div
        v-if="
          displaySubProducts &&
          recommandation.API_et_datasets_utiles_fournis?.length
        "
        class="fr-col-12 fr-p-0"
      >
        <DsfrAccordion title-tag="h5">
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

      <div v-if="solutionsEditeurs?.length" class="fr-col-12 fr-p-0">
        <DsfrAccordion title-tag="h5">
          <template #title>
            <strong>Liste des éditeurs de logiciels</strong>, ayant intégré
            cette API pour ce cas d'usage
          </template>
          <div v-if="solutionsEditeurs === undefined">
            Chargement des données en cours...
          </div>
          <div v-else class="solutions-editeurs fr-mt-2w" role="list">
            <div v-for="solution in solutionsEditeurs" :key="solution.id">
              <SimplifionsEditorSoftwareCard :solution="solution" />
            </div>
          </div>
        </DsfrAccordion>
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

const props = defineProps<{
  recommandation: Recommandation
  displaySubProducts: boolean
}>()

const recommandation = props.recommandation

const hasContent = computed(() => {
  return (
    recommandation.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage ||
    recommandation.Concretement_pour_les_usagers ||
    recommandation.Concretement_pour_vos_agents ||
    recommandation.Ce_que_ne_fait_pas_cette_solution
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

const solutionsEditeurs = ref<SolutionRecord[] | undefined>(undefined)
if (recommandation.Ces_logiciels_l_integrent_deja?.length) {
  grist
    .getRecordsByIds('Solutions', recommandation.Ces_logiciels_l_integrent_deja)
    .then((data) => {
      solutionsEditeurs.value = (data as SolutionRecord[]).filter(
        (record) => record.fields.Visible_sur_simplifions
      )
    })
}
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

.solutions-editeurs {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
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

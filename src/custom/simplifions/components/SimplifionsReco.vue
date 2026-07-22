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
      <span aria-hidden="true" class="fr-icon-arrow-right-circle-fill"></span>
      Moyens d'accès à ces données :
    </h5>

    <DsfrAccordionsGroup v-model="activeAccordion">
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

          <SimplifionsRecoUsefulEndpointsTable
            :endpoints="usefulDataApiFourniesParLaSolution"
            :custom-descriptions="customDescriptions"
            :case-usage-name="recommandation.Nom_complet_du_cas_d_usage"
            :active="activeAccordion === API_ACCORDION_INDEX"
          />
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

      <SimplifionsRecoIntegratingSolutionsAccordion
        title="Via une brique logicielle à intégrer"
        :solutions="integratingSolutionsBriquesTechniques"
        :integration-score-per-solution="integrationScorePerSolution"
        :nom-fournisseur="recommandation.Nom_de_la_recommandation"
        :type-label="typeLabel"
      >
        <p>
          <strong>Briques techniques logicielles</strong> destinées à être
          intégrées dans un système informatique existant et conçues pour le cas
          d'usage «<i>&nbsp;{{ recommandation.Nom_complet_du_cas_d_usage }}&nbsp;</i>» :
        </p>
      </SimplifionsRecoIntegratingSolutionsAccordion>

      <SimplifionsRecoIntegratingSolutionsAccordion
        title="Via un logiciel métier « clé en main »"
        :solutions="integratingSolutionsLogicielsMetiers"
        :integration-score-per-solution="integrationScorePerSolution"
        :nom-fournisseur="recommandation.Nom_de_la_recommandation"
        :type-label="typeLabel"
      >
        <p>
          <strong>Liste des logiciels métier, sur étagère</strong> conçus pour
          le cas d'usage «<i>&nbsp;{{ recommandation.Nom_complet_du_cas_d_usage }}&nbsp;</i>» :
        </p>
      </SimplifionsRecoIntegratingSolutionsAccordion>

      <SimplifionsRecoIntegratingSolutionsAccordion
        title="Via un portail de consultation"
        :solutions="integratingSolutionsPortailsConsultation"
        :integration-score-per-solution="integrationScorePerSolution"
        :nom-fournisseur="recommandation.Nom_de_la_recommandation"
        :type-label="typeLabel"
      >
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
      </SimplifionsRecoIntegratingSolutionsAccordion>
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
import SimplifionsRecoIntegratingSolutionsAccordion from './SimplifionsRecoIntegratingSolutionsAccordion.vue'
import SimplifionsRecoUsefulEndpointsTable from './SimplifionsRecoUsefulEndpointsTable.vue'

const props = defineProps<{
  recommandation: Recommandation
}>()

const recommandation = props.recommandation
const isSolution = !!recommandation.Solution_recommandee

// === Solution-specific ===
const topicSlug = ref<string | undefined>(undefined)
const usefulDataApiFourniesParLaSolution = ref<ApiOrDatasetRecord[] | undefined>(undefined)
const customDescriptions = ref<Record<number, ApiOrDatasetUtiles>>({})

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

// Index of the "Par l'API directement" accordion within the shared group (registered first)
const API_ACCORDION_INDEX = 0
const activeAccordion = ref(-1)
</script>

<style scoped>

.reco-card {
  background-color: var(--background-alt-beige-gris-galet);
}

.icon-green {
  color: var(--text-default-success);
}

:deep(.fr-accordion__btn[aria-expanded='true']) {
  background-color: var(--background-alt-blue-france);
  color: var(--text-action-high-blue-france);
}
</style>

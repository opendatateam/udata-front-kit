<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="test_cas-d-usage-description">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">
            {{ casUsage.Icone_du_titre }} {{ casUsage.Titre }}
          </h1>
          <DraftTag v-if="topic.private" />
        </div>

        <p class="fr-text--lead">
          {{ topic.description }}
        </p>

        <SimplifionsTags :topic="topic" :page-key="pageKey" />
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
              <a
                id="summary-link-1"
                href="#contexte-et-cadre-juridique"
                class="fr-summary__link"
                >Contexte et cadre juridique</a
              >
            </li>
            <li>
              <a
                id="summary-link-2"
                href="#solutions-disponibles"
                class="fr-summary__link"
                >Solutions disponibles</a
              >
              <ol v-if="casUsage.reco_solutions?.length" class="fr-mb-0">
                <li
                  v-for="(group, index) in grouped_reco_solutions"
                  :key="group.title"
                  :class="{
                    'fr-pb-0': index === grouped_reco_solutions.length - 1
                  }"
                >
                  <a
                    :href="`#reco-group-${index + 1}`"
                    class="fr-summary__link"
                    >{{ group.title }}</a
                  >
                </li>
              </ol>
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

    <div class="fr-col-12 fr-col-md-8">
      <h2 id="contexte-et-cadre-juridique" class="h2-cas-usage fr-h2 fr-my-5w">
        Contexte et cadre juridique
      </h2>

      <div>
        <h3 class="fr-h6">
          <span aria-hidden="true" class="fr-icon-map-pin-2-fill"></span>
          Contexte
        </h3>

        <p
          v-if="casUsage.Contexte"
          v-html="fromMarkdown(casUsage.Contexte)"
        ></p>

        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>

      <div>
        <h3 class="fr-h6">
          <span aria-hidden="true" class="fr-icon-newspaper-fill"></span>
          Cadre juridique
        </h3>

        <p
          v-if="casUsage.Cadre_juridique"
          v-html="fromMarkdown(casUsage.Cadre_juridique)"
        ></p>
        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>
    </div>

    <div>
      <h2 id="solutions-disponibles" class="h2-cas-usage fr-h2 fr-my-5w">
        Solutions disponibles
      </h2>

      <div
        v-for="(group, index) in grouped_reco_solutions"
        :key="group.title"
        class="fr-mb-4w"
        :class="{ 'fr-mt-5w': index > 0 }"
      >
        <h3 :id="`reco-group-${index + 1}`" class="h3-cas-usage fr-h3 fr-mb-3w">
          {{ group.title }}
        </h3>

        <div
          v-for="reco_solution in group.reco_solutions"
          :key="reco_solution.Nom_de_la_solution_publique"
        >
          <SimplifionsRecoSolutions
            :reco-solution="reco_solution"
            :with-provided-data-api="group.with_provided_data_api"
            :useful-data-api="usefulDataApi"
            :custom-descriptions="customDescriptionsForDataApi"
          />
        </div>

        <SimplifionsDataApiList
          v-if="group.data_api_recos?.length"
          :data-api-list="group.data_api_recos"
          :custom-descriptions="customDescriptionsForDataApi"
        />
      </div>
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
import type { Topic } from '@/model/topic'
import { formatDate, fromMarkdown } from '@/utils'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import type {
  RecoSolution,
  SimplifionsCasUsagesExtras,
  SimplifionsDataOrApi
} from '../model/cas_usage'
import SimplifionsDataApiList from './SimplifionsDataApiList.vue'
import SimplifionsRecoSolutions from './SimplifionsRecoSolutions.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const casUsage = (props.topic.extras as SimplifionsCasUsagesExtras)[
  'simplifions-cas-d-usages'
]

const customDescriptionsForDataApi =
  casUsage.descriptions_api_et_donnees_utiles.reduce(
    (acc, description) => {
      acc[description.uid_datagouv] = description.Description_de_l_utilisation
      return acc
    },
    {} as Record<string, string>
  )

const usefulDataApi = computed(() => {
  if (!casUsage.API_et_donnees_utiles) {
    return []
  }
  return casUsage.API_et_donnees_utiles.filter(
    (apidOrData) => apidOrData.UID_data_gouv
  )
})

const dataApiNotProvidedByARecoSolution = computed(() => {
  return usefulDataApi.value.filter(
    (apidOrData) =>
      !casUsage.reco_solutions.some((recoSolution) =>
        recoSolution.API_et_data_utiles_fournies_par_la_solution_datagouv_slugs.includes(
          apidOrData.UID_data_gouv
        )
      )
  )
})

const grouped_reco_solutions = computed(() => {
  const first_group_reco_solutions = casUsage.reco_solutions.filter(
    (recoSolution) =>
      recoSolution.Moyens_requis_pour_la_mise_en_oeuvre.includes(
        'Aucun développement, ni budget'
      )
  )
  const second_group_reco_solutions = casUsage.reco_solutions.filter(
    (recoSolution) =>
      !recoSolution.Moyens_requis_pour_la_mise_en_oeuvre.includes(
        'Aucun développement, ni budget'
      )
  )

  const groups: Array<{
    title: string
    reco_solutions: RecoSolution[]
    with_provided_data_api: boolean
    data_api_recos?: SimplifionsDataOrApi[]
  }> = []

  if (first_group_reco_solutions.length) {
    groups.push({
      title: 'Aucun développement, ni budget',
      with_provided_data_api: false,
      reco_solutions: first_group_reco_solutions,
      data_api_recos: []
    })
  }
  if (
    second_group_reco_solutions.length ||
    dataApiNotProvidedByARecoSolution.value.length
  ) {
    groups.push({
      title: 'Avec des moyens techniques ou un éditeur de logiciel',
      with_provided_data_api: true,
      reco_solutions: second_group_reco_solutions,
      data_api_recos: dataApiNotProvidedByARecoSolution.value
    })
  }

  return groups
})
</script>

<style scoped>
.h2-cas-usage {
  color: black;
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}

.h3-cas-usage {
  color: #616161;
}

.bloc-modifications {
  background-color: #f1f1f1;
  padding: 1rem;
}

:deep(blockquote) {
  border-left: 4px solid var(--border-default-grey);
  margin-left: 2rem;
  padding-left: 2rem;
}
</style>

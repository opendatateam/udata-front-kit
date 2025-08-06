<template>
  <div class="reco-solution fr-p-2w fr-mb-2w">
    <h4 class="fr-h4 fr-mb-2w">
      ➡️ {{ reco_solution.Nom_de_la_solution_publique }}
    </h4>

    <div
      class="fr-grid-row fr-grid-row--gutters fr-mt-4w fr-mb-2w fr-mx-2w fr-grid-row--top"
    >
      <div class="fr-col-12 fr-col-xs-8 fr-col-sm-4 fr-col-lg-3">
        <div class="fr-tile fr-tile--sm fr-tile--vertical fr-enlarge-link">
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <p class="fr-tile__title fr-text--lead">
                <router-link
                  class="solution-link"
                  :to="{
                    name: 'solutions_detail',
                    params: { item_id: reco_solution.solution_topic_id }
                  }"
                >
                  {{ reco_solution.Nom_de_la_solution_publique }}
                </router-link>
                <br />
                En savoir plus
              </p>
            </div>
          </div>
          <div class="fr-tile__header">
            <img
              v-if="reco_solution.image_principale?.length"
              :src="gristImageUrl(reco_solution.image_principale[0])"
              class="fr-responsive-img fr-ratio-16x9"
            />
          </div>
        </div>
      </div>

      <div v-if="hasContent" class="fr-col-12 fr-col-sm-8 fr-ml-2w">
        <div
          v-if="
            reco_solution.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_
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
              <strong>
                En quoi cette solution est utile pour ce cas d'usage ?
              </strong>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(
                  reco_solution.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_
                )
              "
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

        <div
          v-if="reco_solution.Concretement_pour_les_usagers_"
          class="reco-section"
        >
          <div class="fr-mr-1w bullet-icon">
            <span aria-hidden="true">🧑</span>
          </div>

          <div class="reco-text-column">
            <div>
              <strong> Concrètement, pour les usagers : </strong>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(reco_solution.Concretement_pour_les_usagers_)
              "
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

        <div
          v-if="reco_solution.Concretement_pour_vos_agents_"
          class="reco-section"
        >
          <div class="fr-mr-1w bullet-icon">
            <span aria-hidden="true">🧑‍💼</span>
          </div>

          <div class="reco-text-column">
            <div>
              <strong> Concrètement, pour vos agents : </strong>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="fromMarkdown(reco_solution.Concretement_pour_vos_agents_)"
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>

        <div
          v-if="reco_solution.Ce_que_ne_fait_pas_cette_solution_"
          class="reco-section"
        >
          <div class="fr-mr-1w bullet-icon">
            <span aria-hidden="true" class="fr-icon-error-fill icon-red"></span>
          </div>

          <div class="reco-text-column">
            <div>
              <strong> Ce que ne fait pas cette solution : </strong>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-html="
                fromMarkdown(reco_solution.Ce_que_ne_fait_pas_cette_solution_)
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
          reco_solution
            .API_et_data_utiles_fournies_par_la_solution_datagouv_slugs?.length
        "
        class="fr-col-12"
      >
        <hr />
        <p>
          <strong>API et données utiles fournies par la solution :</strong>
        </p>
        <ul>
          <li
            v-for="apidOrData in usefulDataApiFourniesParLaSolution"
            :key="apidOrData.UID_data_gouv"
          >
            <SimplifionsRecoDataApiCard
              :api-or-data="apidOrData"
              :custom-description="customDescriptions[apidOrData.UID_data_gouv]"
            />
          </li>
        </ul>
      </div>

      <div
        v-if="reco_solution.solutions_editeurs_topics?.length"
        class="fr-col-12"
      >
        <hr />
        <strong>Ces logiciels d'éditeurs l'intègrent déjà :</strong>
        <br />

        <div class="solutions-editeurs fr-mt-2w" role="list">
          <div
            v-for="solution_editeur in reco_solution.solutions_editeurs_topics"
            :key="solution_editeur.topic_id"
          >
            <router-link
              :to="{
                name: 'solutions_detail',
                params: { item_id: solution_editeur.topic_id }
              }"
            >
              <div class="solution-editeur fr-py-2w">
                <div class="fr-px-4w">
                  <strong>{{ solution_editeur.solution_name }}</strong
                  ><br />
                  <span class="fr-text--xs"
                    >par {{ solution_editeur.editeur_name }}</span
                  >
                </div>
                <div class="fr-pr-1w">
                  <span
                    aria-hidden="true"
                    class="fr-icon-arrow-right-line fr-icon--sm"
                  ></span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import type { RecoSolution, SimplifionsDataOrApi } from '../model/cas_usage'
import { gristImageUrl } from './simplifions_utils'

const props = defineProps<{
  recoSolution: RecoSolution
  usefulDataApi: SimplifionsDataOrApi[]
  customDescriptions: Record<string, string>
}>()

const reco_solution = props.recoSolution

const hasContent = computed(() => {
  return (
    reco_solution.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_ ||
    reco_solution.Concretement_pour_les_usagers_ ||
    reco_solution.Concretement_pour_vos_agents_ ||
    reco_solution.Ce_que_ne_fait_pas_cette_solution_
  )
})

const usefulDataApiFourniesParLaSolution = computed(() => {
  return props.usefulDataApi
    .filter((data) =>
      reco_solution.API_et_data_utiles_fournies_par_la_solution_datagouv_slugs.includes(
        data.UID_data_gouv
      )
    )
    .sort((a, b) => {
      // First sort by custom description length (longer first)
      const aDescLength = props.customDescriptions[a.UID_data_gouv]?.length || 0
      const bDescLength = props.customDescriptions[b.UID_data_gouv]?.length || 0

      if (aDescLength !== bDescLength) {
        return bDescLength - aDescLength // Longer descriptions first
      }

      // Then sort by name alphabetically
      return a.Nom_donnees_ou_API.localeCompare(b.Nom_donnees_ou_API)
    })
})
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
  background-color: #f6f6f6;
  /* padding: 15px; */
  border-radius: 4px;
}

.solutions-editeurs {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.solution-editeur {
  background-color: white;
  border-bottom: 4px solid rgb(53, 88, 162);
  color: black;
  display: flex;
  align-items: center;
}

.solution-editeur:hover {
  background-color: #e9e9e9;
}

.solution-editeur .fr-icon-arrow-right-line {
  color: rgb(53, 88, 162);
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
</style>

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
              v-if="
                reco_solution.image_principale &&
                reco_solution.image_principale.length > 0
              "
              :src="gristImageUrl(reco_solution.image_principale[0])"
              class="fr-responsive-img fr-ratio-16x9"
            />
          </div>
        </div>
      </div>

      <div class="fr-col-12 fr-col-sm-8">
        <p
          v-if="
            reco_solution.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_
          "
        >
          <strong>
            <span
              aria-hidden="true"
              style="color: #27a658"
              class="fr-icon-success-fill"
            ></span>
            En quoi cette solution est utile pour ce cas d'usage ?
          </strong>
          <br />
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-html="
              fromMarkdown(
                reco_solution.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_
              )
            "
          ></span>
          <!-- eslint-enable vue/no-v-html -->
        </p>

        <p v-if="reco_solution.Concretement_pour_les_usagers_">
          <strong>🧑 Concrètement, pour les usagers :</strong>
          <br />
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-html="fromMarkdown(reco_solution.Concretement_pour_les_usagers_)"
          ></span>
          <!-- eslint-enable vue/no-v-html -->
        </p>

        <p v-if="reco_solution.Concretement_pour_vos_agents_">
          <strong>🧑‍💼 Concrètement, pour vos agents :</strong>
          <br />
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-html="fromMarkdown(reco_solution.Concretement_pour_vos_agents_)"
          ></span>
          <!-- eslint-enable vue/no-v-html -->
        </p>

        <p v-if="reco_solution.Ce_que_ne_fait_pas_cette_solution_">
          <strong>
            <span
              aria-hidden="true"
              style="color: #ff292f"
              class="fr-icon-error-fill"
            ></span>
            Ce que ne fait pas cette solution :
          </strong>
          <br />
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-html="
              fromMarkdown(reco_solution.Ce_que_ne_fait_pas_cette_solution_)
            "
          ></span>
          <!-- eslint-enable vue/no-v-html -->
        </p>
      </div>

      <div
        class="fr-col-12"
        v-if="reco_solution.solutions_editeurs_topics.length > 0"
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
import type { RecoSolution } from '../model/cas_usage'
import { gristImageUrl } from './simplifions_utils'

const props = defineProps<{
  recoSolution: RecoSolution
}>()

const reco_solution = props.recoSolution
</script>

<style scoped>
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
</style>

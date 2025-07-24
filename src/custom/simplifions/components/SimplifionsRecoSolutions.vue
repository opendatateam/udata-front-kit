<template>
  <div class="reco-solution fr-p-2w fr-mb-2w">
    <h4 class="fr-h4 fr-mb-2w">
      ➡️ {{ reco_solution.Nom_de_la_solution_publique }}
    </h4>

    <div
      class="fr-grid-row fr-grid-row--gutters fr-my-4w fr-mx-2w fr-grid-row--top"
    >
      <div class="fr-col-12 fr-col-xs-8 fr-col-sm-4 fr-col-lg-3">
        <div class="fr-tile fr-tile--sm fr-tile--vertical fr-enlarge-link">
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <p class="fr-tile__title fr-text--lead">
                <a
                  class="solution-link"
                  :href="`/solutions/${reco_solution.solution_topic_id}`"
                >
                  {{ reco_solution.Nom_de_la_solution_publique }}
                </a>
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
</style>

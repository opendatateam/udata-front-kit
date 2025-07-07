<template>
  <div class="reco-solution fr-p-2w fr-mb-2w">
    <h4 class="fr-h4 fr-mb-2w">
      ➡️ {{ reco_solution.Nom_de_la_solution_publique }}
    </h4>

    <div class="fr-grid-row fr-grid-row--gutters fr-m-4w fr-grid-row--top">
      <div class="fr-col-6 fr-col-md-3">
        <div class="fr-tile fr-tile--sm fr-tile--vertical fr-enlarge-link">
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <p class="fr-tile__title fr-text--lead">
                <router-link
                  v-if="relatedSolution"
                  :to="`/solutions/${relatedSolution.slug}`"
                >
                  {{ reco_solution.Nom_de_la_solution_publique }}
                </router-link>
                <a v-else :href="reco_solution.url_solution">
                  {{ reco_solution.Nom_de_la_solution_publique }}
                </a>
                <br />
                <span class="fr-text-xs">En savoir plus</span>
              </p>
            </div>
          </div>
          <div class="fr-tile__header">
            <img
              :src="gristImageUrl(reco_solution.image_principale?.[0])"
              class="fr-responsive-img fr-ratio-16x9"
            />
          </div>
        </div>
      </div>

      <div class="fr-col-12 fr-col-md-8">
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
          {{
            reco_solution.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_
          }}
        </p>

        <p v-if="reco_solution.Concretement_pour_les_usagers_">
          <strong>🧑 Concrètement, pour les usagers :</strong>
          <br />
          {{ reco_solution.Concretement_pour_les_usagers_ }}
        </p>

        <p v-if="reco_solution.Concretement_pour_vos_agents_">
          <strong>🧑‍💼 Concrètement, pour vos agents :</strong>
          <br />
          {{ reco_solution.Concretement_pour_vos_agents_ }}
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
          {{ reco_solution.Ce_que_ne_fait_pas_cette_solution_ }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reco-solution {
  background-color: #f6f6f6;
  /* padding: 15px; */
  border-radius: 4px;
}
</style>

<script setup lang="ts">
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { onMounted, ref } from 'vue'
import { gristImageUrl } from './simplifions_utils'

const props = defineProps<{
  reco_solution: Record<string, any>
}>()

const reco_solution = props.reco_solution

// Reactive variable for the related solution
const relatedSolution = ref<Topic | null>(null)

// API instance for fetching topics
const topicsAPI = new TopicsAPI({ version: 2 })

// Function to fetch the related solution
const fetchRelatedSolution = async () => {
  if (!reco_solution?.solution_slug) return

  try {
    // Fetch all solutions topics
    const response = await topicsAPI.list({
      params: {
        tag: 'simplifions-solutions',
        page_size: 100 // Fetch a large number to get all potential matches
      }
    })

    // Find the solution that matches the solution_slug (take the last one)
    const matchingSolutions = response.data.filter((topic: Topic) => {
      const solutionExtras = (topic.extras as any)['simplifions-solutions']
      if (!solutionExtras) return false

      return solutionExtras.slug === reco_solution.solution_slug
    })
    relatedSolution.value =
      matchingSolutions.length > 0
        ? matchingSolutions[matchingSolutions.length - 1]
        : null
  } catch (error) {
    console.error('Error fetching related solution:', error)
    relatedSolution.value = null
  }
}

// Fetch related solution when component mounts
onMounted(() => {
  fetchRelatedSolution()
})
</script>

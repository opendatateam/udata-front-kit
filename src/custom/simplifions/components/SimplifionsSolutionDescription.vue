<template>
  <div class="">
    <p class="fr-text--small">
      <em>{{ solution.Description_courte }}</em>
    </p>

    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">
            {{ solution.Ref_Nom_de_la_solution }}
          </h1>
        </div>

        <p class="fr-text--lead">
          {{ solution.Description_longue }}
        </p>

        <ul v-if="tags.length > 0" class="fr-badges-group fr-mt-2w">
          <li v-for="t in tags" :key="`${t.type}-${t.id}`">
            <TagComponent :tag="t" />
          </li>
        </ul>
      </div>

      <div class="fr-col-12 fr-col-md-4">
        <h2 id="producer" class="subtitle fr-mb-1v">Auteur</h2>
        <div v-if="topic.organization" class="fr-grid-row fr-grid-row--middle">
          <div class="fr-col-auto fr-mr-1w">
            <OrganizationLogo :object="topic" />
          </div>
          <p class="fr-col fr-m-0">
            <a class="fr-link" :href="topic.organization.page">
              <OrganizationNameWithCertificate
                :organization="topic.organization"
              />
            </a>
          </p>
        </div>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Création</h2>
        <time :datetime="topic.created_at">{{
          formatDate(topic.created_at)
        }}</time>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
        <time :datetime="topic.last_modified">{{
          formatDate(topic.last_modified)
        }}</time>
      </div>
    </div>

    <figure
      aria-label="© Légende de l‘image"
      role="group"
      class="fr-content-media"
    >
      <div class="example-image fr-content-media__img">
        <img
          alt="Exemple d'interface de l'annuaire des entreprises"
          :src="gristImageUrl(solution.Image_principale[0])"
          class="fr-responsive-img fr-ratio-16x9"
        />
      </div>
      <figcaption class="fr-content-media__caption">
        {{ solution.Legende_image_principale }}
      </figcaption>
    </figure>

    <div class="fr-col-12 fr-col-md-8">
      <h2>Caractéristiques de la solution</h2>
      <ul>
        <li><strong>Opérateur :</strong>{{ solution.operateur_nom }}</li>
        <li>
          <strong>Type de solution :</strong>
          {{ solution.types_de_solution.join(' ou ') }}
        </li>
        <li><strong>Prix :</strong> {{ solution.Prix_ }}</li>
        <li>
          <strong>Moyens requis pour la mise en oeuvre :</strong>
          <TagComponent
            :tag="t"
            v-for="t in tags_budget"
            :key="`${t.type}-${t.id}`"
            class="inline-tag"
          />
        </li>
        <li>
          <strong>Niveau de simplification :</strong>
          <TagComponent
            :tag="t"
            v-for="t in tags_niveau_simplification"
            :key="`${t.type}-${t.id}`"
            class="inline-tag"
          />
        </li>
      </ul>

      <h2>Description</h2>
      <p v-html="fromMarkdown(solution.Description_longue)"></p>

      <p>
        <span
          aria-hidden="true"
          style="color: #27a658"
          class="fr-icon-success-fill"
        ></span>
        <strong>Cette solution permet :</strong>
      </p>

      <p v-html="fromMarkdown(solution.Cette_solution_permet_)"></p>

      <p>
        <span
          aria-hidden="true"
          style="color: #ff292f"
          class="fr-icon-error-fill"
        ></span>
        <strong> Cette solution ne permet pas :</strong>
      </p>

      <p v-html="fromMarkdown(solution.Cette_solution_ne_permet_pas_)"></p>

      <p>
        <a
          rel="noopener noreferrer"
          :href="solution.URL_Consulter_la_solution_"
          class="fr-btn fr-my-4w"
        >
          Consulter le site de la solution
        </a>
      </p>

      <h2 class="colored-title fr-h2 fr-my-5w">Cas d'usages simplifiables</h2>
    </div>

    <div v-if="loading" class="fr-text--center fr-my-4w">
      <span
        class="fr-icon-loader-line fr-icon--rotate"
        aria-hidden="true"
      ></span>
      Chargement des cas d'usages...
    </div>
    <div
      v-else-if="relatedCasUsages.length > 0"
      class="fr-grid-row fr-grid-row--gutters"
    >
      <div
        v-for="casUsage in relatedCasUsages"
        :key="casUsage.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4 fr-mb-3w"
      >
        <div class="fr-tile fr-tile--horizontal fr-enlarge-link">
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <h3 class="fr-tile__title">
                <router-link :to="`/cas-d-usages/${casUsage.slug}`">
                  {{ casUsage.name }}
                </router-link>
              </h3>
              <p class="fr-tile__detail">
                {{ casUsage.description || 'Aucune description disponible' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="fr-text--sm">
      Aucun cas d'usage ne référence cette solution pour le moment.
    </p>

    <h2 class="colored-title fr-h2 fr-mt-8w fr-mb-0">
      Données et API utilisées
    </h2>
  </div>
</template>

<style scoped>
h2.colored-title {
  color: black;
  background-color: rgb(167, 212, 205);
  padding: 2px 4px;
  display: inline-block;
}
h3 {
  color: #616161;
}
.example-image {
  display: inline-block;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 8px;
  border: 4px solid #000;
}

.example-image img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.inline-tag {
  display: inline-flex;
  margin-right: 0.5em;
  margin-left: 0.5em;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fr-icon--rotate {
  animation: rotate 1s linear infinite;
}
</style>

<script setup lang="ts">
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import TagComponent from '@/components/TagComponent.vue'
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { formatDate, fromMarkdown } from '@/utils'
import { useTagsByRef } from '@/utils/tags'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import { onMounted, ref } from 'vue'
import { gristImageUrl } from './simplifions_utils'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const topicRef = ref(props.topic)
const tags = useTagsByRef(props.pageKey, topicRef)
const tags_niveau_simplification = tags.value.filter(
  (t: any) => t.type === 'types-de-simplification'
)
const tags_budget = tags.value.filter((t: any) => t.type === 'budget')

const solution = (props.topic.extras as any)['simplifions-solutions'] as Record<
  string,
  any
>

// Reactive variables for cas d'usages
const loading = ref(false)
const relatedCasUsages = ref<Topic[]>([])

// API instance for fetching topics
const topicsAPI = new TopicsAPI({ version: 2 })

// Function to fetch related cas d'usages
const fetchRelatedCasUsages = async () => {
  if (!solution?.slug) return

  loading.value = true
  try {
    // Fetch all cas d'usages topics
    const response = await topicsAPI.list({
      params: {
        tag: 'simplifions-cas-d-usages',
        page_size: 100 // Fetch a large number to get all potential matches
      }
    })

    console.log("Fetched cas d'usages topics:", response.data.length)
    console.log('Current solution:', {
      slug: solution.slug,
      id: solution.Solution_publique || solution.id || props.topic.id
    })

    // *****************************************************
    // Note : This is not ideal, we should do this filtering
    // once in the backend and reference the topics ids in
    // the solution's metadata.
    // *****************************************************

    // Filter topics that reference this solution in their reco_solutions
    relatedCasUsages.value = response.data.filter((topic: Topic) => {
      const casUsageExtras = (topic.extras as any)['simplifions-cas-d-usages']
      if (!casUsageExtras) return false

      // Check for reco_solutions array with solution_slug matching
      if (casUsageExtras.reco_solutions?.length > 0) {
        const foundBySlug = casUsageExtras.reco_solutions.some(
          (recoSolution: any) => recoSolution.solution_slug === solution.slug
        )
        if (foundBySlug) return true
      }

      // Check for Solutions_publiques_recommandees array with numeric IDs
      if (casUsageExtras.Solutions_publiques_recommandees?.length > 0) {
        const solutionId =
          solution.Solution_publique || solution.id || props.topic.id
        const foundById =
          casUsageExtras.Solutions_publiques_recommandees.includes(solutionId)
        if (foundById) return true
      }

      return false
    })
  } catch (error) {
    console.error("Error fetching related cas d'usages:", error)
    relatedCasUsages.value = []
  } finally {
    loading.value = false
  }
}

// Fetch related cas d'usages when component mounts
onMounted(() => {
  fetchRelatedCasUsages()
})
</script>

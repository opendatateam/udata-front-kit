<template>
  <div class="solution-description">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">
            {{ solution.Ref_Nom_de_la_solution }}
          </h1>
          <DraftTag v-if="topic.private" />
          <SimplifionsSolutionTag :solution="solution" />
        </div>

        <p class="fr-text--lead">
          {{ solution.Description_courte }}
        </p>

        <SimplifionsTags
          :topic="topic"
          :page-key="pageKey"
          :show-simplification="false"
          :show-budget="false"
        />

        <ul class="fr-my-4w">
          <li>
            <strong>Fournisseur :</strong>
            <span v-if="solution.operateur_nom_long"
              >{{ solution.operateur_nom_long }} | </span
            >{{ solution.operateur_nom }}
          </li>
          <li>
            <strong>Type de solution :</strong>
            {{ solution.types_de_solution.join(' ou ') }}
          </li>
          <li><strong>Prix :</strong> {{ solution.Prix_ }}</li>
          <li>
            <strong>Moyens requis pour la mise en oeuvre :</strong>
            <TagComponent
              v-for="t in tags_budget"
              :key="`${t.type}-${t.id}`"
              :tag="t"
              class="inline-tag"
            />
          </li>
          <li>
            <strong>Niveau de simplification :</strong>
            <TagComponent
              v-for="t in tags_niveau_simplification"
              :key="`${t.type}-${t.id}`"
              :tag="t"
              class="inline-tag"
            />
          </li>
        </ul>
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
                href="#possibilites-simplification"
                class="fr-summary__link"
                >Possibilités de simplification</a
              >
            </li>
            <li>
              <a
                id="summary-link-1"
                href="#cas-usages-simplifiables"
                class="fr-summary__link"
                >Cas d'usages simplifiables</a
              >
            </li>
            <li>
              <a
                id="summary-link-2"
                href="#donnees-api-utilisees"
                class="fr-summary__link"
                >Données et API utilisées</a
              >
            </li>
          </ol>
          <hr class="fr-hr fr-my-2w" />
          <p class="subtitle">
            Contenu rédigé par :
            <span v-if="topic.organization" style="font-weight: normal">
              <a :href="topic.organization.page">
                <OrganizationNameWithCertificate
                  :organization="topic.organization"
                />
              </a>
            </span>
            <br />
            <span style="font-weight: normal">
              le
              <time :datetime="topic.created_at"
                >{{ formatDate(topic.created_at) }}.</time
              >
            </span>
            <br />
            <span class="fr-text--xs" style="font-weight: normal"
              >Modifié le
              <time :datetime="topic.last_modified"
                >{{ formatDate(topic.last_modified) }}.</time
              >
            </span>
          </p>
        </nav>
      </div>
    </div>
    <hr v-if="!solution.Image_principale" class="fr-hr fr-my-2w" />
    <figure
      v-if="solution.Image_principale && solution.Image_principale.length > 0"
      aria-label="© Légende de l'image"
      role="group"
      class="fr-content-media"
    >
      <div class="example-image fr-content-media__img">
        <img
          :alt="solution.Legende_image_principale"
          :src="gristImageUrl(solution.Image_principale?.[0])"
          class="fr-responsive-img fr-ratio-16x9"
        />
      </div>
      <figcaption class="fr-content-media__caption">
        {{ solution.Legende_image_principale }}
      </figcaption>
    </figure>

    <div class="fr-col-12 fr-col-md-8 fr-mb-4w">
      <div v-if="solution.Description_longue">
        <h2
          id="possibilites-simplification"
          class="colored-title fr-h2 fr-my-5w"
        >
          Possibilités de simplification :
        </h2>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="fromMarkdown(solution.Description_longue)"></p>
      </div>

      <div v-if="solution.Cette_solution_permet_">
        <p>
          <strong>
            <span
              aria-hidden="true"
              style="color: #27a658"
              class="fr-icon-success-fill"
            ></span>
            Cette solution permet :
          </strong>
        </p>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="fromMarkdown(solution.Cette_solution_permet_)"></p>
      </div>

      <div v-if="solution.Cette_solution_ne_permet_pas_">
        <p>
          <strong>
            <span
              aria-hidden="true"
              style="color: #ff292f"
              class="fr-icon-error-fill"
            ></span>
            Cette solution ne permet pas :
          </strong>
        </p>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="fromMarkdown(solution.Cette_solution_ne_permet_pas_)"></p>
      </div>

      <p v-if="solution.URL_Consulter_la_solution_">
        <a
          rel="noopener noreferrer"
          :href="solution.URL_Consulter_la_solution_"
          class="fr-btn fr-my-4w"
        >
          Consulter le site de la solution
        </a>
      </p>
      <p v-else>⚠ Pas d'url disponible pour consulter cette solution.</p>
    </div>

    <h2 id="cas-usages-simplifiables" class="colored-title fr-h2 fr-my-5w">
      Cas d'usages simplifiables
    </h2>
    <div
      v-if="relatedCasUsages.length > 0"
      class="fr-grid-row fr-grid-row--gutters"
    >
      <div
        v-for="casUsage in relatedCasUsages"
        :key="casUsage.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4 fr-mb-3w test__cas-d-usage-card"
      >
        <div class="fr-tile fr-tile--horizontal fr-enlarge-link">
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <h3 class="fr-tile__title">
                <router-link
                  :to="{
                    name: 'cas-d-usages_detail',
                    params: { item_id: casUsage.slug }
                  }"
                  class="cas-d-usage-link"
                >
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

    <div v-if="usefulDataApi && usefulDataApi.length > 0">
      <h2 id="donnees-api-utilisees" class="colored-title fr-h2 fr-mt-8w">
        Données et API utilisées
      </h2>

      <SimplifionsDataApiList :data-api-list="usefulDataApi" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TagComponent from '@/components/TagComponent.vue'
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { formatDate, fromMarkdown } from '@/utils'
import { useTagsByRef } from '@/utils/tags'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import { onMounted, ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import type { SimplifionsSolutionsExtras } from '../model/solution'
import { gristImageUrl } from './simplifions_utils'
import SimplifionsDataApiList from './SimplifionsDataApiList.vue'
import SimplifionsSolutionTag from './SimplifionsSolutionTag.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const topicRef = ref(props.topic)
const tags = useTagsByRef(props.pageKey, topicRef)
const tags_niveau_simplification = tags.value.filter(
  (t) => t.type === 'types-de-simplification'
)
const tags_budget = tags.value.filter((t) => t.type === 'budget')

const solution = (props.topic.extras as SimplifionsSolutionsExtras)[
  'simplifions-solutions'
]

// Reactive variables for cas d'usages
const relatedCasUsages = ref<Topic[]>([])

// API instance for fetching topics
const topicsAPI = new TopicsAPI({ version: 2 })

// Function to fetch related cas d'usages
const fetchRelatedCasUsages = async () => {
  // Check if we have topic IDs to fetch
  if (!solution?.cas_d_usages_topics_ids?.length) {
    relatedCasUsages.value = []
    return
  }

  const loader = useLoading().show({ enforceFocus: false })
  try {
    // Fetch only the specific topics by their IDs
    const topicPromises = solution.cas_d_usages_topics_ids.map(
      (topicId: string) => topicsAPI.get({ entityId: topicId })
    )

    const topics = await Promise.all(topicPromises)
    relatedCasUsages.value = topics

    console.log("Fetched related cas d'usages:", topics.length)
  } catch (error) {
    console.error("Error fetching related cas d'usages:", error)
    relatedCasUsages.value = []
  } finally {
    loader.hide()
  }
}

const usefulDataApi = computed(() => {
  if (!solution?.API_et_data_disponibles) {
    return []
  }
  return solution.API_et_data_disponibles.filter(
    (apidOrData) => apidOrData.UID_data_gouv
  )
})

// Fetch related cas d'usages when component mounts
onMounted(() => {
  fetchRelatedCasUsages()
})
</script>

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
  padding: 0 0.5rem 0 0.5rem;
}
</style>

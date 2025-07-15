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

      <h2>Description</h2>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="fromMarkdown(solution.Description_longue)"></p>

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

    <div
      v-if="relatedCasUsages.length > 0"
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
                <a :href="`/cas-d-usages/${casUsage.slug}`">
                  {{ casUsage.name }}
                </a>
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

<script setup lang="ts">
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import TagComponent from '@/components/TagComponent.vue'
import type { Topic } from '@/model/topic'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { formatDate, fromMarkdown } from '@/utils'
import { useTagsByRef } from '@/utils/tags'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import { onMounted, ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
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
}
</style>

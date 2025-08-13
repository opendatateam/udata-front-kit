<template>
  <!-- eslint-disable vue/no-v-html -->
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
          <span v-if="solution.Description_courte">
            {{ solution.Description_courte }}
          </span>
          <span v-else>⚠ Description non renseignée</span>
        </p>

        <SimplifionsTags
          :topic="topic"
          :page-key="pageKey"
          :show-simplification="false"
          :show-budget="false"
        />

        <ul class="fr-my-4w">
          <li>
            <strong>Fournisseur : </strong>
            <span v-if="solution.operateur_nom_long || solution.operateur_nom">
              <span v-if="solution.operateur_nom_long">
                {{ solution.operateur_nom_long }} |
              </span>
              {{ solution.operateur_nom }}
            </span>
            <span v-else>Non renseigné</span>
          </li>
          <li>
            <strong>Type de solution : </strong>
            <HumanReadableList
              v-if="solution.types_de_solution?.length"
              :items="solution.types_de_solution"
              :bold-items="false"
              last-item-separator="ou"
            />
            <span v-else>Non renseigné</span>
          </li>
          <li>
            <strong>Prix :</strong>
            {{ solution.Prix_ ? solution.Prix_ : 'Non renseigné' }}
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
    <hr v-if="!solution.Image_principale" class="fr-hr fr-my-2w" />
    <figure
      v-if="solution.Image_principale?.length"
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
      <div>
        <h2
          id="possibilites-simplification"
          class="colored-title fr-h2 fr-my-5w"
        >
          Possibilités de simplification :
        </h2>
        <p
          v-if="solution.Description_longue"
          v-html="fromMarkdown(solution.Description_longue)"
        ></p>
        <p v-else class="fr-text--sm">
          <i>Aucune description actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>

      <div>
        <p>
          <strong>
            <span
              aria-hidden="true"
              class="fr-icon-success-fill icon-green"
            ></span>
            Cette solution permet :
          </strong>
        </p>

        <p
          v-if="solution.Cette_solution_permet_"
          v-html="fromMarkdown(solution.Cette_solution_permet_)"
        ></p>
        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>

      <div>
        <p>
          <strong>
            <span aria-hidden="true" class="fr-icon-error-fill icon-red"></span>
            Cette solution ne permet pas :
          </strong>
        </p>

        <p
          v-if="solution.Cette_solution_ne_permet_pas_"
          v-html="fromMarkdown(solution.Cette_solution_ne_permet_pas_)"
        ></p>
        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>

      <p v-if="solution.URL_Consulter_la_solution_">
        <a
          rel="noopener noreferrer"
          :href="solution.URL_Consulter_la_solution_"
          class="fr-btn fr-my-4w"
          target="_blank"
        >
          Consulter le site de la solution
        </a>
      </p>
      <p v-else class="fr-text--sm">
        <i>Aucun lien vers un site officiel actuellement.</i>
      </p>
    </div>

    <h2 id="cas-usages-simplifiables" class="colored-title fr-h2 fr-my-5w">
      Cas d'usages simplifiables
    </h2>
    <div
      v-if="relatedCasUsages.length"
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
                  {{
                    (casUsage.extras as SimplifionsCasUsagesExtras)[
                      'simplifions-cas-d-usages'
                    ].Icone_du_titre
                  }}
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
      <i>Aucun cas d'usage n'est référencé pour cette solution actuellement.</i>
      <a href="#modification-contenu">✍️ Proposer des cas d'usages</a>
    </p>

    <h2 id="donnees-api-utilisees" class="colored-title fr-h2 fr-mt-8w">
      Données et API utilisées
    </h2>
    <SimplifionsDataApiList
      v-if="usefulDataApi.length"
      :data-api-list="usefulDataApi"
    />
    <p v-else class="fr-text--sm">
      <i
        >Aucun jeu de données ou API référencé pour cette solution
        actuellement.</i
      >
      <a href="#modification-contenu">✍️ Proposer un contenu</a>.
    </p>

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
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { formatDate, fromMarkdown } from '@/utils'
import { OrganizationNameWithCertificate } from '@datagouv/components'
import { onMounted, ref } from 'vue'
import type { SimplifionsCasUsagesExtras } from '../model/cas_usage'
import type { SimplifionsSolutionsExtras } from '../model/solution'
import { gristImageUrl } from './simplifions_utils'
import SimplifionsDataApiList from './SimplifionsDataApiList.vue'
import SimplifionsSolutionTag from './SimplifionsSolutionTag.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

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

  try {
    // Fetch only the specific topics by their IDs
    const topicPromises = solution.cas_d_usages_topics_ids.map(
      (topicId: string) => topicsAPI.get({ entityId: topicId })
    )

    const topics = await Promise.all(topicPromises)
    relatedCasUsages.value = topics

    console.log(`Fetched ${topics.length} related cas d'usages`)
  } catch (error) {
    console.error("Error fetching related cas d'usages:", error)
    relatedCasUsages.value = []
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

.icon-green {
  color: #27a658;
}

.icon-red {
  color: #ff292f;
}

.bloc-modifications {
  background-color: #f1f1f1;
  padding: 1rem;
}
</style>

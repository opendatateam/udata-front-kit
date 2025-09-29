<template>
  <!-- eslint-disable vue/no-v-html -->
  <div v-if="solution === undefined" class="loading">
    Chargement de la solution en cours...
  </div>
  <div v-else class="solution-description">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">
            {{ topic.name }}
          </h1>
          <DraftTag v-if="topic.private" />
          <SimplifionsSolutionTag :topic-solution="topic" />
        </div>

        <p class="fr-text--lead">
          {{ topic.description }}
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
            <HumanReadableList
              v-if="solution.Nom_de_l_operateur?.length"
              :items="solution.Nom_de_l_operateur"
              :bold-items="false"
            />
            <span v-else>Non renseigné</span>
          </li>
          <li>
            <strong>Type de solution : </strong>
            <HumanReadableList
              v-if="solution.Type_de_solution?.length"
              :items="solution.Type_de_solution"
              :bold-items="false"
              last-item-separator="ou"
            />
            <span v-else>Non renseigné</span>
          </li>
          <li>
            <strong>Prix :</strong>
            {{ solution.Prix ? solution.Prix : 'Non renseigné' }}
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
                href="#donnees-api-fournies"
                class="fr-summary__link"
                >Données et API fournies</a
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

    <hr v-if="!solution.Image" class="fr-hr fr-my-2w" />
    <figure
      v-if="solution.Image?.length"
      aria-label="© Légende de l'image"
      role="group"
      class="fr-content-media"
    >
      <div class="example-image fr-content-media__img">
        <img
          :alt="solution.Legende_de_l_image || ''"
          :src="grist.imageUrl(solution.Image?.[0])"
          class="fr-responsive-img fr-ratio-16x9"
        />
      </div>
      <figcaption
        v-if="solution.Legende_de_l_image"
        class="fr-content-media__caption"
      >
        {{ solution.Legende_de_l_image }}
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
          v-if="solution.Cette_solution_permet"
          v-html="fromMarkdown(solution.Cette_solution_permet)"
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
          v-if="solution.Cette_solution_ne_permet_pas"
          v-html="fromMarkdown(solution.Cette_solution_ne_permet_pas)"
        ></p>
        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>

      <p v-if="solution.Site_internet">
        <a
          rel="noopener noreferrer"
          :href="solution.Site_internet"
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
      v-if="solution.Recommande_pour_les_cas_d_usages?.length"
      class="fr-grid-row fr-grid-row--gutters"
    >
      <SimplifionsCasDusageRelatedCard
        v-for="casUsageId in solution.Recommande_pour_les_cas_d_usages"
        :key="casUsageId"
        :cas-usage-id="casUsageId"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4 fr-mb-3w"
      />
    </div>

    <p v-else class="fr-text--sm">
      <i>Aucun cas d'usage n'est référencé pour cette solution actuellement.</i>
      <a href="#modification-contenu">✍️ Proposer des cas d'usages</a>
    </p>

    <div id="donnees-api-utilisees">
      <h2 class="colored-title fr-h2 fr-mt-8w">Données et API utilisées</h2>
      <ul
        v-if="solution.API_ou_datasets_integres?.length"
        class="fr-grid-row fr-grid-row--gutters list-none fr-pt-2w"
      >
        <li
          v-for="apiOrDataset in apiOrDatasets"
          :key="apiOrDataset.UID_datagouv"
          class="fr-col-12 fr-py-0 fr-mb-2w"
        >
          <SimplifionsDataApi :api-or-dataset="apiOrDataset" />
        </li>
      </ul>

      <p v-else class="fr-text--sm">
        <i
          >Aucun jeu de données ou API utilisé pour cette solution
          actuellement.</i
        >
        <a href="#modification-contenu">✍️ Proposer un contenu</a>.
      </p>
    </div>

    <div id="donnees-api-fournies">
      <h2 class="colored-title fr-h2 fr-mt-8w">Données et API fournies</h2>
      <ul
        v-if="solution.APIs_ou_datasets_fournis?.length"
        class="fr-grid-row fr-grid-row--gutters list-none fr-pt-2w"
      >
        <li
          v-for="apiOrDataset in apisOrDatasetsFournis"
          :key="apiOrDataset.UID_datagouv"
          class="fr-col-12 fr-py-0 fr-mb-2w"
        >
          <SimplifionsDataApi :api-or-dataset="apiOrDataset" />
        </li>
      </ul>
      <p v-else class="fr-text--sm">
        <i
          >Aucun jeu de données ou API fourni pour cette solution
          actuellement.</i
        >
        <a href="#modification-contenu">✍️ Proposer des données et API</a>
      </p>
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
import { OrganizationNameWithCertificate } from '@datagouv/components-next'
import { grist } from '../grist'
import type { ApiOrDataset, Solution } from '../model/grist'
import type { TopicSolutionsExtras } from '../model/topics'
import SimplifionsCasDusageRelatedCard from './SimplifionsCasDusageRelatedCard.vue'
import SimplifionsDataApi from './SimplifionsDataApi.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const solutionId = (props.topic.extras as TopicSolutionsExtras)[
  'simplifions-v2-solutions'
].id

const solution = ref<Solution | undefined>(undefined)
const apiOrDatasets = ref<ApiOrDataset[] | undefined>(undefined)
const apisOrDatasetsFournis = ref<ApiOrDataset[] | undefined>(undefined)

grist.getRecord('Solutions', solutionId).then((data) => {
  solution.value = data.fields as Solution

  if (solution.value.API_ou_datasets_integres?.length) {
    grist
      .getRecordsByIds(
        'APIs_et_datasets',
        solution.value.API_ou_datasets_integres
      )
      .then((data) => {
        apiOrDatasets.value = (
          data.map((record) => record.fields) as ApiOrDataset[]
        ).filter((apiOrDataset) => apiOrDataset.Visible_sur_simplifions)
      })
  }

  if (solution.value.APIs_ou_datasets_fournis?.length) {
    grist
      .getRecordsByIds(
        'APIs_et_datasets',
        solution.value.APIs_ou_datasets_fournis
      )
      .then((data) => {
        apisOrDatasetsFournis.value = (
          data.map((record) => record.fields) as ApiOrDataset[]
        ).filter((apiOrDataset) => apiOrDataset.Visible_sur_simplifions)
      })
  }
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

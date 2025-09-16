<template>
  <!-- eslint-disable vue/no-v-html -->
  <div v-if="casUsage === undefined" class="loading">
    Chargement du cas d'usage en cours...
  </div>
  <div v-else class="test_cas-d-usage-description">
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--top">
      <div class="fr-col-12 fr-col-md-8">
        <div class="topic__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">
            {{ topic.name }}
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
              <ol v-if="casUsage.Recommandations?.length" class="fr-mb-0">
                <li
                  v-for="(group, index) in grouped_recommandations"
                  :key="group.title"
                  :class="{
                    'fr-pb-0': index === grouped_recommandations.length - 1
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

      <div v-if="recommandations === undefined">
        Chargement des recommandations en cours...
      </div>
      <div
        v-for="(group, index) in grouped_recommandations"
        :key="group.title"
        class="fr-mb-4w"
        :class="{ 'fr-mt-5w': index > 0 }"
      >
        <h3 :id="`reco-group-${index + 1}`" class="h3-cas-usage fr-h3 fr-mb-3w">
          {{ group.title }}
        </h3>

        <div
          v-for="recommandation in group.recommandations"
          :key="recommandation.Nom_de_la_recommandation"
        >
          <SimplifionsRecoSolutions
            v-if="recommandation.Solution_recommandee"
            :recommandation="recommandation"
            :display-sub-products="group.displaySubProducts"
          />
          <SimplifionsRecoDataApi
            v-else-if="recommandation.API_ou_datasets_recommandes"
            :recommandation="recommandation"
          />
        </div>
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
import { OrganizationNameWithCertificate } from '@datagouv/components-next'
import { grist } from '../grist.ts'
import type { CasUsage, Recommandation } from '../model/grist'
import type { TopicCasUsagesExtras } from '../model/topics'
import SimplifionsRecoDataApi from './SimplifionsRecoDataApi.vue'
import SimplifionsRecoSolutions from './SimplifionsRecoSolutions.vue'
import SimplifionsTags from './SimplifionsTags.vue'

const props = defineProps<{
  topic: Topic
  pageKey: string
}>()

const casUsageId = (props.topic.extras as TopicCasUsagesExtras)[
  'simplifions-v2-cas-d-usages'
].id

const casUsage = ref<CasUsage | undefined>(undefined)
const recommandations = ref<Recommandation[] | undefined>(undefined)

grist.getRecord('Cas_d_usages', casUsageId).then((data) => {
  casUsage.value = data.fields as CasUsage

  grist
    .getRecords('Recommandations', { id: casUsage.value.Recommandations })
    .then((data) => {
      recommandations.value = (
        data.map((d) => d.fields) as Recommandation[]
      ).filter((reco) => reco.Visible_sur_simplifions)
    })
})

const grouped_recommandations = computed(() => {
  const first_group_recommandations = {
    title: 'Aucun développement, ni budget',
    recommandations: [] as Recommandation[],
    displaySubProducts: false
  }

  const second_group_recommandations = {
    title: 'Avec des moyens techniques ou un éditeur de logiciel',
    recommandations: [] as Recommandation[],
    displaySubProducts: true
  }

  recommandations.value?.forEach((recommandation) => {
    if (recommandation.budget_slugs.includes('aucun-developpement-ni-budget')) {
      first_group_recommandations.recommandations.push(recommandation)
    } else {
      second_group_recommandations.recommandations.push(recommandation)
    }
  })

  const groups = []

  if (first_group_recommandations.recommandations.length > 0) {
    groups.push(first_group_recommandations)
  }

  if (second_group_recommandations.recommandations.length > 0) {
    groups.push(second_group_recommandations)
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

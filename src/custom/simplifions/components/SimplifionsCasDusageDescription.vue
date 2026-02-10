<template>
  <ContentPlaceholder v-if="!casUsage" />
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
                href="#donnees-disponibles"
                class="fr-summary__link"
                >Données disponibles</a
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

    <div class="fr-col-12 fr-col-md-8">
      <h2 id="contexte-et-cadre-juridique" class="h2-cas-usage fr-h2 fr-my-5w">
        Contexte et cadre juridique
      </h2>

      <div>
        <h3 class="fr-h6">
          <span aria-hidden="true" class="fr-icon-map-pin-2-fill"></span>
          Contexte
        </h3>

        <!-- eslint-disable vue/no-v-html -->
        <p
          v-if="casUsage.Contexte"
          v-html="fromMarkdown(casUsage.Contexte)"
        ></p>
        <!-- eslint-enable vue/no-v-html -->

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

        <!-- eslint-disable vue/no-v-html -->
        <p
          v-if="casUsage.Cadre_juridique"
          v-html="fromMarkdown(casUsage.Cadre_juridique)"
        ></p>
        <!-- eslint-enable vue/no-v-html -->
        <p v-else class="fr-text--sm">
          <i>Aucun contenu actuellement.</i>
          <a href="#modification-contenu">✍️ Proposer un contenu</a>.
        </p>
      </div>
    </div>

    <div>
      <h2 id="donnees-disponibles" class="h2-cas-usage fr-h2 fr-my-5w">
        Données disponibles
      </h2>

      <div v-if="recommandations === undefined">
        Chargement des recommandations en cours...
      </div>
      <div
        v-for="recommandation in recommandations"
        :key="recommandation.Nom_de_la_recommandation"
        class="fr-mb-4w"
      >
        <SimplifionsRecoSolutions
          v-if="recommandation.Solution_recommandee"
          :recommandation="recommandation"
        />
        <SimplifionsRecoDataApi
          v-else-if="recommandation.API_ou_datasets_recommandes"
          :recommandation="recommandation"
        />
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
import ContentPlaceholder from '@/components/ContentPlaceholder.vue'
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
  hideLoader: (() => void) | null
}>()

const casUsageId = (props.topic.extras as TopicCasUsagesExtras)[
  'simplifions-v2-cas-d-usages'
].id

const casUsage = ref<CasUsage | undefined>(undefined)
const recommandations = ref<Recommandation[] | undefined>(undefined)

grist.getRecord('Cas_d_usages', casUsageId).then((data) => {
  casUsage.value = data.fields as CasUsage

  // hide parent component loader
  props.hideLoader?.()

  grist
    .getRecords(
      'Recommandations',
      { id: casUsage.value.Recommandations },
      { sort: 'manualSort' }
    )
    .then((data) => {
      recommandations.value = (
        data.map((d) => d.fields) as Recommandation[]
      ).filter((reco) => reco.Visible_sur_simplifions)
    })
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

/* Markdown spacing fix for all ul that are inside a p, and right after a p*/
:deep(p p + ul) {
  margin-top: -1rem !important;
  margin-bottom: 1rem !important;
}
</style>

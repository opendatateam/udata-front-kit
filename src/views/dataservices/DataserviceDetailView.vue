<script setup lang="ts">
import type { Dataset } from '@datagouv/components'
import {
  DatasetCard,
  OrganizationNameWithCertificate,
  ReadMore,
  Well
} from '@datagouv/components'
import { computed, inject, onMounted, ref } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import VIconCustom from '@/components/VIconCustom.vue'
import Swagger from '@/components/dataservices/SwaggerComponent.vue'
import ContactPoints from '@/components/datasets/ContactPoints.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useCurrentPageConf, useRouteParamsAsString } from '@/router/utils'
import { useDataserviceStore } from '@/store/DataserviceStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'

const route = useRouteParamsAsString()
const dataserviceId = route.params.item_id

const dataserviceStore = useDataserviceStore()

const dataservice = computed(() => dataserviceStore.get(dataserviceId))
const datasets: Ref<Dataset[]> = ref([])

const { pageKey, pageConf } = useCurrentPageConf()
const showDiscussions = pageConf.discussions.display
const isSwaggerOpened = ref(false)

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const links = computed(() => {
  const breadcrumbs = [{ to: '/', text: 'Accueil' }]
  breadcrumbs.push({
    to: pageConf.list_all === true ? `/${pageKey || 'dataservices'}` : '',
    text: pageConf.breadcrumb_title || pageConf.title
  })
  breadcrumbs.push({ to: '', text: dataservice.value?.title ?? '' })
  return breadcrumbs
})

const tabTitles = [
  { title: 'Données', tabId: 'tab-0', panelId: 'tab-content-0' },
  { title: 'Discussions', tabId: 'tab-1', panelId: 'tab-content-1' },
  { title: 'Informations', tabId: 'tab-2', panelId: 'tab-content-2' }
]

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(dataservice))

const discussionWellTitle = showDiscussions
  ? 'Participer aux discussions'
  : 'Voir les discussions'
const discussionWellDescription = showDiscussions
  ? 'Vous avez une question sur cette API ? Rendez-vous sur data.gouv.fr pour participer aux discussions.'
  : 'Vous avez une question sur cette API ? Rendez-vous sur data.gouv.fr pour voir les discussions.'

const openDataGouvDiscussions = () =>
  window.open(
    `${dataservice.value?.self_web_url}#/discussions`,
    'datagouv-discussion'
  )

const goToBusinessDocumentation = () => {
  window.open(dataservice.value?.business_documentation_url ?? undefined)
}

onMounted(() => {
  dataserviceStore
    .load(dataserviceId, { toasted: false, redirectNotFound: true })
    .then(() => {
      setAccessibilityProperties(dataservice.value?.title)
      dataserviceStore
        .getDatasetsForDataservice(dataservice.value)
        .then((data) => {
          datasets.value = data
        })
    })
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer v-if="dataservice">
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-2w">
      <div class="fr-col-12 fr-col-md-8">
        <h1 class="fr-mb-2v">{{ dataservice.title }}</h1>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <div class="fr-col-12 fr-col-md-4">
        <!-- Producer -->
        <h2 id="producer" class="subtitle fr-mb-1v">
          <span>Producteur</span>
        </h2>
        <div
          v-if="dataservice.organization"
          class="fr-grid-row fr-grid-row--middle"
        >
          <OrganizationLogo
            :object="dataservice"
            :size="32"
            class="fr-mr-1-5v"
          />
          <p class="fr-col fr-m-0">
            <a class="fr-link" :href="dataservice.organization.page">
              <OrganizationNameWithCertificate
                :organization="dataservice.organization"
              />
            </a>
          </p>
        </div>
        <!-- contact points -->
        <template v-if="dataservice.contact_points.length">
          <h2 id="attributions" class="subtitle fr-mb-1v fr-mt-3v">Contact</h2>
          <ContactPoints :contact-points="dataservice.contact_points" />
        </template>
        <!-- last update -->
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
        <div>{{ formatDate(dataservice.metadata_modified_at, true) }}</div>
        <!-- rate limiting -->
        <template v-if="dataservice.rate_limiting">
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Limite d'appels</h2>
          <div>{{ dataservice.rate_limiting }}</div>
        </template>
        <!-- availability -->
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Taux de disponibilité</h2>
        <div v-if="dataservice.availability">
          {{ dataservice.availability }}%
        </div>
        <div v-else>Non communiqué</div>
        <!-- access_type -->
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Accès</h2>
        <DsfrBadge
          v-if="dataservice.access_type === 'open'"
          type="success"
          label="Ouvert"
          class="fr-mb-1v"
          :no-icon="true"
        ></DsfrBadge>
        <DsfrBadge
          v-if="dataservice.access_type === 'open_with_account'"
          type="warning"
          label="Ouvert avec compte"
          class="fr-mb-1v"
          :no-icon="true"
        ></DsfrBadge>
        <DsfrBadge
          v-if="dataservice.access_type === 'restricted'"
          type="warning"
          label="Restreint"
          class="fr-mb-1v"
          :no-icon="true"
        ></DsfrBadge>
        <div v-if="dataservice.authorization_request_url" class="fr-mt-0">
          <a
            :href="dataservice.authorization_request_url"
            rel="ugc nofollow noopener"
            target="_blank"
            class="fr-text--sm fr-link"
            >Faire une demande d'habilitation</a
          >
        </div>
      </div>
    </div>

    <div
      v-if="dataservice.business_documentation_url"
      class="dataservice-well flex items-center justify-between"
    >
      <div class="text-datagouv-dark font-bold text-xl">Accéder à l'API</div>
      <DsfrButton
        icon="fr-icon-external-link-line"
        @click="goToBusinessDocumentation()"
      >
        Documentation métier
      </DsfrButton>
    </div>

    <div
      v-if="dataservice.machine_documentation_url"
      class="dataservice-well fr-mt-2w"
    >
      <button
        type="button"
        class="width-100 flex items-center justify-between swagger-button"
        @click="isSwaggerOpened = !isSwaggerOpened"
      >
        <div class="text-datagouv-dark font-bold text-xl">Swagger</div>
        <VIconCustom v-if="isSwaggerOpened" name="arrow-up-s-line" />
        <VIconCustom v-else name="arrow-down-s-line" />
      </button>
      <Swagger
        v-if="isSwaggerOpened"
        :url="dataservice.machine_documentation_url"
      />
    </div>

    <DsfrTabs
      v-model="activeTab"
      class="fr-mt-4w"
      tab-list-name="Groupes d'attributs de l'API"
      :tab-titles="tabTitles"
    >
      <!-- Données -->
      <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0">
        <div class="border-bottom border-default-grey fr-pb-4w">
          <h2 class="fr-mb-1v subtitle subtitle--uppercase">
            {{
              `${dataservice.datasets.total} jeu${dataservice.datasets.total > 1 ? 'x' : ''} de données`
            }}
          </h2>
          <DatasetCard
            v-for="dataset in datasets"
            :key="dataset.id"
            :dataset="dataset"
            :dataset-url="`/datasets/${dataset.id}`"
          ></DatasetCard>
        </div>
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1">
        <Well
          v-if="!pageConf.discussions.create"
          color="blue-cumulus"
          weight="regular"
        >
          <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
            <div class="fr-col-12 fr-col-lg-8">
              <p class="fr-text--bold fr-mb-0">{{ discussionWellTitle }}</p>
              <p class="fr-text--alt fr-text--sm f-italic fr-m-0">
                {{ discussionWellDescription }}
              </p>
            </div>
            <div class="fr-col-12 fr-col-lg-4 text-align-right">
              <DsfrButton
                label="Voir les discussions sur data.gouv.fr"
                icon="fr-icon-external-link-line"
                size="sm"
                :icon-right="true"
                @click="openDataGouvDiscussions"
              />
            </div>
          </div>
        </Well>
        <DiscussionsList
          v-if="showDiscussions"
          :subject="dataservice"
          empty-message="Pas de discussion pour cette API."
        />
      </DsfrTabContent>

      <!-- Informations -->
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
        <div class="fr-pb-3w border-bottom border-default-grey">
          <h2 class="fr-mb-3w subtitle subtitle--uppercase">
            Informations techniques
          </h2>
          <div class="metadata-list fr-text--sm fr-m-0">
            <div class="fr-grid-row">
              <div class="fr-mb-3w fr-col-12 fr-col-md-6">
                <h3 class="subtitle fr-mb-2v">Dernière mise à jour</h3>
                <div class="fr-text--sm fr-m-0">
                  {{ formatDate(dataservice.metadata_modified_at) }}
                </div>
              </div>
              <div class="fr-mb-3w fr-col-12 fr-col-md-6">
                <h3 class="subtitle fr-mb-2v">ID</h3>
                <div class="fr-text--sm fr-m-0">{{ dataservice.id }}</div>
              </div>
              <div class="fr-mb-3w fr-col-12 fr-col-md-6">
                <h3 class="subtitle fr-mb-2v">Date de création</h3>
                <div class="fr-text--sm fr-m-0">
                  {{ formatDate(dataservice.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>

<style scoped>
.dataservice-well {
  font-size: 1.25rem;
  color: var(--blue-cumulus-sun-368-moon-732);
  border: 1px solid var(--blue-cumulus-sun-368-moon-732);
  border-radius: 0.25rem;
  padding: 0.75rem;
  background-color: var(--background-alt-grey);
}

.swagger-button {
  min-height: 42px;
}
</style>

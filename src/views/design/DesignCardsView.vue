<script setup lang="ts">
import {
  DataserviceCard,
  DatasetCard,
  ReuseCard
} from '@datagouv/components-next'
import { RiBookShelfLine, RiTerminalLine } from '@remixicon/vue'
import { capitalize, type Component } from 'vue'

import CardTypeBadge from '@/components/CardTypeBadge.vue'
import DesignExample from '@/components/design/DesignExample.vue'
import DesignGroup from '@/components/design/DesignGroup.vue'
import DesignSection from '@/components/design/DesignSection.vue'
import NetworkCard from '@/components/NetworkCard.vue'
import OrganizationCard from '@/components/OrganizationCard.vue'
import SubSectionCards from '@/components/sections/SubSectionCards.vue'
import DatasetInTopicCard from '@/components/topics/DatasetInTopicCard.vue'
import TopicCard from '@/components/topics/TopicCard.vue'
import { ResolvedFactor, type Factor } from '@/model/topic'
import { useNetworksEntries, usePageConf, useSiteId } from '@/utils/config'
import {
  exampleDataservices,
  exampleDataset,
  exampleDatasets,
  exampleOrganizations,
  exampleReuses,
  exampleSubsection,
  exampleTopics,
  findTopicsPageKey,
  galleryUrl
} from '@/utils/design/cardExamples'
import { loadSiteCards } from '@/utils/design/loadSiteCards'

const router = useRouter()

const topicsPageKey = findTopicsPageKey()
const topics = topicsPageKey ? exampleTopics(topicsPageKey) : []
const topicLabel = topicsPageKey
  ? usePageConf(topicsPageKey).labels.singular
  : 'thématique'

// these cards link to named routes that only exist on some sites
const hasOrganizationRoute = router.hasRoute('organization_detail')
const hasDatasetRoute = router.hasRoute('datasets_detail')
const networks = Object.entries(useNetworksEntries()).slice(0, 2)

const factor: Factor = {
  title: exampleDataset.title,
  description: null,
  tags: [],
  extras: {} as Factor['extras'],
  element: { class: 'Dataset', id: exampleDataset.id }
}
const deletedFactor = new ResolvedFactor(factor, useSiteId())
deletedFactor.remoteDeleted = true

const SiteCards = shallowRef<Component>()
loadSiteCards().then((siteCards) => {
  SiteCards.value = siteCards
})
</script>

<template>
  <h1 class="fr-h2">Cartes</h1>
  <p>
    Les cartes disponibles, avec leurs principales variantes. Les données sont
    fictives : certains liens mènent à des pages inexistantes.
  </p>

  <DesignGroup id="generic" title="Cartes génériques">
    <DesignSection id="datasets" title="Jeu de données">
      <DesignExample
        v-for="example in exampleDatasets"
        :key="example.data.id"
        :label="example.label"
      >
        <DatasetCard
          :dataset="example.data"
          :dataset-url="galleryUrl('datasets')"
          :organization-url="null"
          :show-description-short="example.showDescription ?? true"
          title-tag="h4"
        />
      </DesignExample>
    </DesignSection>

    <DesignSection id="dataservices" title="API">
      <DesignExample
        v-for="example in exampleDataservices"
        :key="example.data.id"
        :label="example.label"
      >
        <DataserviceCard
          :dataservice="example.data"
          :dataservice-url="galleryUrl('dataservices')"
          :organization-url="null"
          :show-description="example.showDescription ?? true"
          title-tag="h4"
        />
      </DesignExample>
      <DesignExample label="Dans un élément de liste, avec badge de type">
        <CardTypeBadge label="API" :icon="RiTerminalLine">
          <DataserviceCard
            :dataservice="exampleDataservices[0].data"
            :dataservice-url="galleryUrl('dataservices')"
            :organization-url="null"
            :show-description="false"
            title-tag="h4"
          />
        </CardTypeBadge>
      </DesignExample>
    </DesignSection>

    <DesignSection id="reuses" title="Réutilisation">
      <DesignExample
        v-for="example in exampleReuses"
        :key="example.data.id"
        :label="example.label"
        narrow
      >
        <ReuseCard
          :reuse="example.data"
          :reuse-url="galleryUrl('reuses')"
          :organization-url="null"
          title-tag="h4"
        />
      </DesignExample>
      <DesignExample
        v-for="example in exampleReuses"
        :key="`${example.data.id}-horizontal`"
        :label="`${example.label} (horizontale)`"
      >
        <ReuseCard
          :reuse="example.data"
          :reuse-url="galleryUrl('reuses')"
          :organization-url="null"
          title-tag="h4"
          horizontal
        />
      </DesignExample>
    </DesignSection>

    <DesignSection
      id="topics"
      :title="capitalize(topicLabel)"
      :unavailable="!topicsPageKey"
    >
      <template v-if="topicsPageKey">
        <DesignExample
          v-for="example in topics"
          :key="example.data.id"
          :label="example.label"
        >
          <TopicCard
            :page-key="topicsPageKey"
            :topic="example.data"
            :topic-url="galleryUrl('topics')"
            :show-description="example.showDescription ?? true"
            title-tag="h4"
          />
        </DesignExample>
        <DesignExample label="Dans un élément de liste, avec badge de type">
          <CardTypeBadge :label="topicLabel" :icon="RiBookShelfLine">
            <TopicCard
              :page-key="topicsPageKey"
              :topic="topics[0].data"
              :topic-url="galleryUrl('topics')"
              :show-description="false"
              :show-tags="false"
              title-tag="h4"
            />
          </CardTypeBadge>
        </DesignExample>
        <DesignExample
          v-if="hasDatasetRoute"
          label="Jeu de données d'un élément, supprimé sur data.gouv.fr"
        >
          <DatasetInTopicCard
            :factor="deletedFactor"
            :dataset-content="exampleDataset"
          />
        </DesignExample>
      </template>
    </DesignSection>

    <DesignSection
      id="organizations"
      title="Organisation"
      :unavailable="!hasOrganizationRoute"
    >
      <DesignExample
        v-for="example in exampleOrganizations"
        :key="example.data.id"
        :label="example.label"
        narrow
      >
        <OrganizationCard :organization="example.data" heading-level="h4" />
      </DesignExample>
    </DesignSection>

    <DesignSection
      id="networks"
      title="Réseau"
      description="Réseaux réels issus de la configuration du site."
      :unavailable="networks.length === 0"
    >
      <DesignExample
        v-for="[slug, network] in networks"
        :key="slug"
        :label="slug"
        narrow
      >
        <NetworkCard :slug="slug" :network="network" heading-level="h4" />
      </DesignExample>
    </DesignSection>

    <DesignSection id="subsections" title="Carte de contenu">
      <DesignExample label="Avec et sans image">
        <SubSectionCards :subsection="exampleSubsection" />
      </DesignExample>
    </DesignSection>
  </DesignGroup>

  <DesignGroup
    v-if="SiteCards"
    id="custom"
    title="Cartes spécifiques à ce site"
  >
    <component :is="SiteCards" />
  </DesignGroup>
</template>

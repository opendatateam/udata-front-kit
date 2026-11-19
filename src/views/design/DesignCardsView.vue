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
import TopicCard from '@/components/topics/TopicCard.vue'
import { useNetworksEntries, usePageConf } from '@/utils/config'
import { useLabels } from '@/utils/labels'
import {
  exampleDataservices,
  exampleDatasets,
  exampleOrganizations,
  exampleReuses,
  exampleSubsection,
  exampleTopics,
  findTopicsPageKey,
  galleryUrl
} from '@/views/design/cardExamples'

const router = useRouter()

const topicsPageKey = findTopicsPageKey()
const topics = topicsPageKey ? exampleTopics(topicsPageKey) : []
const topicLabels = topicsPageKey
  ? useLabels(usePageConf(topicsPageKey).labels)
  : undefined
const topicLabel = topicLabels?.singular ?? 'thématique'
const inTopicLabel = `Dans ${topicLabels?.articles.un ?? 'une'} ${topicLabel}, avec badge de type`

// the organization card links to a named route that only exists on some sites
const hasOrganizationRoute = router.hasRoute('organization_detail')
const networks = Object.entries(useNetworksEntries()).slice(0, 2)

// lazy loaded: site blocks can't be imported on the other sites
const siteCardsLoaders = import.meta.glob<{ default: Component }>(
  '../../custom/*/components/design/DesignSiteCards.vue'
)
const loadSiteCards =
  siteCardsLoaders[
    `../../custom/${import.meta.env.VITE_SITE_ID}/components/design/DesignSiteCards.vue`
  ]
const SiteCards = loadSiteCards ? defineAsyncComponent(loadSiteCards) : null
</script>

<template>
  <h1 class="fr-h2">Cartes</h1>
  <p>
    Les cartes disponibles, avec leurs principales variantes. Les données sont
    fictives : certains liens mènent à des pages inexistantes.
  </p>

  <DesignGroup id="generic" title="Cartes génériques">
    <DesignSection id="datasets" title="Jeu de données" component="DatasetCard">
      <DesignExample
        v-for="example in exampleDatasets"
        :key="example.data.id"
        :label="example.label"
      >
        <DatasetCard
          :dataset="example.data"
          :dataset-url="galleryUrl"
          :organization-url="null"
          :show-description-short="example.showDescription ?? true"
          title-tag="h4"
        />
      </DesignExample>
    </DesignSection>

    <DesignSection
      id="dataservices"
      title="API"
      component="DataserviceCard, CardTypeBadge"
    >
      <DesignExample
        v-for="example in exampleDataservices"
        :key="example.data.id"
        :label="example.label"
      >
        <DataserviceCard
          :dataservice="example.data"
          :dataservice-url="galleryUrl"
          :organization-url="null"
          :show-description="example.showDescription ?? true"
          title-tag="h4"
        />
      </DesignExample>
      <DesignExample :label="inTopicLabel">
        <CardTypeBadge label="API" :icon="RiTerminalLine">
          <DataserviceCard
            :dataservice="exampleDataservices[0].data"
            :dataservice-url="galleryUrl"
            :organization-url="null"
            :show-description="false"
            title-tag="h4"
          />
        </CardTypeBadge>
      </DesignExample>
    </DesignSection>

    <DesignSection id="reuses" title="Réutilisation" component="ReuseCard">
      <DesignExample
        v-for="example in exampleReuses"
        :key="example.data.id"
        :label="example.label"
        narrow
      >
        <ReuseCard
          :reuse="example.data"
          :reuse-url="galleryUrl"
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
          :reuse-url="galleryUrl"
          :organization-url="null"
          title-tag="h4"
          horizontal
        />
      </DesignExample>
    </DesignSection>

    <DesignSection
      v-if="topicsPageKey"
      id="topics"
      :title="capitalize(topicLabel)"
      component="TopicCard, CardTypeBadge"
    >
      <DesignExample
        v-for="example in topics"
        :key="example.data.id"
        :label="example.label"
      >
        <TopicCard
          :page-key="topicsPageKey"
          :topic="example.data"
          :topic-url="galleryUrl"
          :show-description="example.showDescription ?? true"
          title-tag="h4"
        />
      </DesignExample>
      <DesignExample :label="inTopicLabel">
        <CardTypeBadge :label="topicLabel" :icon="RiBookShelfLine">
          <TopicCard
            :page-key="topicsPageKey"
            :topic="topics[0].data"
            :topic-url="galleryUrl"
            :show-description="false"
            :show-tags="false"
            title-tag="h4"
          />
        </CardTypeBadge>
      </DesignExample>
    </DesignSection>

    <DesignSection
      v-if="hasOrganizationRoute"
      id="organizations"
      title="Organisation"
      component="OrganizationCard"
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
      v-if="networks.length > 0"
      id="networks"
      title="Réseau"
      component="NetworkCard"
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

    <DesignSection
      id="subsections"
      title="Carte de contenu"
      component="SubSectionCards"
    >
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

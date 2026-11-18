<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'

import DesignExample from '@/components/design/DesignExample.vue'
import DesignSection from '@/components/design/DesignSection.vue'
import { usePageConf } from '@/utils/config'
import {
  exampleDataset,
  exampleTagsForPage,
  galleryUrl
} from '@/utils/design/cardExamples'
import DatasetOrIndicatorCard from '../datasets/DatasetOrIndicatorCard.vue'
import DatasetOrIndicatorInTopicCard from '../datasets/DatasetOrIndicatorInTopicCard.vue'
import IndicatorCard from '../indicators/IndicatorCard.vue'

const indicator: DatasetV2 = {
  ...exampleDataset,
  id: 'demo-indicator',
  slug: 'demo-indicator',
  title: 'Part modale du vélo dans les déplacements domicile-travail',
  // the page filter prefix is what identifies a dataset as an indicator
  tags: [
    usePageConf('indicators').filter_prefix ?? '',
    ...exampleTagsForPage('indicators')
  ]
}
</script>

<template>
  <DesignSection id="indicators" title="Indicateur">
    <DesignExample label="Avec tags">
      <IndicatorCard
        :dataset="indicator"
        :organization-url="null"
        title-tag="h4"
      />
    </DesignExample>
    <DesignExample label="Sans tags ni description">
      <IndicatorCard
        :dataset="indicator"
        :organization-url="null"
        :show-description="false"
        :show-tags="false"
        title-tag="h4"
      />
    </DesignExample>
  </DesignSection>

  <DesignSection
    id="datasets-or-indicators"
    title="Jeu de données ou indicateur"
  >
    <DesignExample label="Liste de jeux de données, indicateur">
      <DatasetOrIndicatorCard
        :dataset="indicator"
        :dataset-url="galleryUrl('datasets-or-indicators') as object"
        :organization-url="null"
        title-tag="h4"
      />
    </DesignExample>
    <DesignExample label="Liste de jeux de données, jeu de données">
      <DatasetOrIndicatorCard
        :dataset="exampleDataset"
        :dataset-url="galleryUrl('datasets-or-indicators') as object"
        :organization-url="null"
        title-tag="h4"
      />
    </DesignExample>
    <DesignExample label="Dans une collection, indicateur">
      <DatasetOrIndicatorInTopicCard
        :dataset="indicator"
        :dataset-url="galleryUrl('datasets-or-indicators') as object"
        :organization-url="null"
        :show-description-short="false"
        title-tag="h4"
      />
    </DesignExample>
    <DesignExample label="Dans une collection, jeu de données">
      <DatasetOrIndicatorInTopicCard
        :dataset="exampleDataset"
        :dataset-url="galleryUrl('datasets-or-indicators') as object"
        :organization-url="null"
        :show-description-short="false"
        title-tag="h4"
      />
    </DesignExample>
  </DesignSection>
</template>

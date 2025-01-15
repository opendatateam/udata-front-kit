<script setup lang="ts">
import { formatDate, fromMarkdown } from '@/utils'
import { toRef } from 'vue'
import type { Indicator } from '../../model/indicator'
import { useIndicatorExtras } from '../../utils/indicator'
import InformationPanelItem from './informations/InformationPanelItem.vue'
import InformationPanelSection from './informations/InformationPanelSection.vue'

const props = defineProps({
  indicator: {
    type: Object as () => Indicator,
    required: true
  }
})

const indicator = toRef(props, 'indicator')

const { sources } = useIndicatorExtras(indicator)
</script>

<template>
  <template v-for="source in sources" :key="source.url">
    <h2 class="subtitle subtitle--uppercase">{{ source.nom }}</h2>
    <InformationPanelSection>
      <template #description>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="fromMarkdown(source.description)"></div>
      </template>
      <InformationPanelItem title="URL source">
        <a :href="source.url" target="_blank">{{ source.url }}</a>
      </InformationPanelItem>
      <InformationPanelItem title="Distributeur" :value="source.distributeur" />
      <InformationPanelItem title="Producteur" :value="source.producteur" />
      <InformationPanelItem
        v-if="indicator.temporal_coverage"
        title="Plage temporelle"
      >
        {{ formatDate(source.plage_temporelle.start, true) }} -
        {{ formatDate(source.plage_temporelle.end, true) }}
      </InformationPanelItem>
    </InformationPanelSection>
  </template>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
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

const indicatorRef = toRef(props, 'indicator')

const { sources } = useIndicatorExtras(indicatorRef)
</script>

<template>
  <h2 class="subtitle subtitle--uppercase">Sources</h2>
  <template v-for="source in sources" :key="source.url">
    <InformationPanelSection>
      <template #description>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="fromMarkdown(source.description)"></div>
      </template>
      <InformationPanelItem title="Nom" :value="source.nom" />
      <InformationPanelItem title="URL source">
        <a :href="source.url" target="_blank">{{ source.url }}</a>
      </InformationPanelItem>
      <InformationPanelItem title="Distributeur" :value="source.distributeur" />
      <InformationPanelItem title="Producteur" :value="source.producteur" />
      <InformationPanelItem
        title="Plage temporelle"
        :value="source.plage_temporelle"
      />
    </InformationPanelSection>
  </template>
</template>

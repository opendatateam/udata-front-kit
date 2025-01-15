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

const indicator = toRef(props.indicator)

const { api, axes } = useIndicatorExtras(indicator)
</script>

<template>
  <InformationPanelSection title="Documentation utilisation API">
    <template #description-below>
      <div class="fr-mt-1w">
        <h3 class="subtitle fr-mb-2v">Documentation</h3>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="fromMarkdown(api?.description || '')"></div>
      </div>
    </template>
    <InformationPanelItem
      title="Nom cubes API"
      :value="api?.noms_cubes.join(', ')"
    />
    <InformationPanelItem title="Id indicateur" :value="api?.id" />
    <template v-for="(values, axis, index) in axes" :key="axis">
      <InformationPanelItem :title="`Axe n°${index + 1} - ${axis}`">
        <ul>
          <li v-for="value in values" :key="value">{{ value }}</li>
        </ul>
      </InformationPanelItem>
    </template>
  </InformationPanelSection>
</template>

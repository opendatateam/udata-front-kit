<script setup lang="ts">
import { formatDate } from '@/utils'
import {
  CopyButton,
  DateRangeDetails,
  DescriptionListDetails,
  ExtraAccordion,
  LicenseBadge,
  Tag
} from '@datagouv/components-next'
import { computed, toRef } from 'vue'
import type { Indicator } from '../../model/indicator'
import { UNFILLED_LABEL, useIndicatorExtras } from '../../utils/indicator'
import InformationPanelItem from './informations/InformationPanelItem.vue'
import InformationPanelSection from './informations/InformationPanelSection.vue'

const props = defineProps({
  indicator: {
    type: Object as () => Indicator,
    required: true
  }
})

const indicator = toRef(props, 'indicator')
const spatialCoverage = computed(() =>
  (indicator.value.spatial?.zones || []).map((sz) => sz.name).join(', ')
)
const { unite, mailles } = useIndicatorExtras(indicator)
</script>

<template>
  <div class="divide-y">
    <!-- Couverture -->
    <InformationPanelSection title="Couverture" small>
      <InformationPanelItem
        title="Couverture géographique"
        :value="spatialCoverage"
        small
      />
      <InformationPanelItem
        v-if="indicator.temporal_coverage"
        title="Couverture temporelle"
        small
      >
        <DateRangeDetails :range="indicator.temporal_coverage" />
      </InformationPanelItem>
    </InformationPanelSection>

    <!-- Détails techniques -->
    <InformationPanelSection title="Détails techniques" small>
      <InformationPanelItem title="Unité" :value="unite" small />
      <InformationPanelItem
        title="Mailles"
        :value="mailles.length ? mailles.join(', ') : UNFILLED_LABEL"
        small
      />
      <InformationPanelItem
        title="Date de création"
        :value="formatDate(indicator.created_at)"
        small
      />
      <InformationPanelItem
        title="Date de mise à jour"
        :value="formatDate(indicator.last_update)"
        small
      />
      <InformationPanelItem
        v-if="indicator.frequency"
        title="Fréquence de mise à jour"
        :value="indicator.frequency.label"
        small
      />
      <InformationPanelItem
        v-if="
          indicator.extras['ecospheres-indicateurs']
            .next_expected_update_quarter
        "
        title="Prochaine mise à jour attendue"
        :value="
          indicator.extras[
            'ecospheres-indicateurs'
          ].next_expected_update_quarter.replace('Q', 'T')
        "
        small
      />
      <InformationPanelItem title="Identifiant" small>
        {{ indicator.id }}
        <CopyButton
          class="!-mt-0.5"
          label="Copier l'identifiant"
          copied-label="Identifiant copié"
          :text="indicator.id"
          :hide-label="true"
        />
      </InformationPanelItem>
      <InformationPanelItem v-if="indicator.license" title="Licence" small>
        <LicenseBadge :license="indicator.license" />
      </InformationPanelItem>
      <InformationPanelItem
        v-if="indicator.tags && indicator.tags.length"
        title="Mots-clés"
        is-row
        small
      >
        <DescriptionListDetails class="flex flex-wrap gap-2 items-start">
          <Tag v-for="tag in indicator.tags" :key="tag" type="secondary">
            {{ tag }}
          </Tag>
        </DescriptionListDetails>
      </InformationPanelItem>
    </InformationPanelSection>

    <!-- Extras -->
    <div class="pt-6 informations-extras">
      <ExtraAccordion
        v-if="indicator.extras && Object.keys(indicator.extras).length"
        button-text="Voir les extras"
        title-text="Extras"
        :extra="indicator.extras"
        title-level="h3"
      />
    </div>
  </div>
</template>

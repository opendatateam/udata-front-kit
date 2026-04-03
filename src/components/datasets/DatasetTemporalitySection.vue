<script setup lang="ts">
import type {
  ExtendedDatasetV2WithFullObject,
  TypedHarvest
} from '@/model/dataset'
import {
  DateRangeDetails,
  DescriptionListDetails,
  DescriptionListTerm,
  useFormatDate
} from '@datagouv/components-next'

const props = defineProps<{
  dataset: ExtendedDatasetV2WithFullObject
}>()

const { formatDate } = useFormatDate()

const harvest = props.dataset.harvest as TypedHarvest
const harvestCreatedAt = harvest?.created_at
const harvestIssuedAt = harvest?.issued_at
const harvestModifiedAt = harvest?.modified_at
</script>

<template>
  <div class="space-y-1 py-6">
    <h3 class="uppercase text-gray-plain text-sm font-bold">Temporalité</h3>
    <dl class="grid grid-cols-1 md:grid-cols-3 gap-6 p-0">
      <div>
        <DescriptionListTerm>Création</DescriptionListTerm>
        <DescriptionListDetails>{{
          formatDate(harvestCreatedAt ?? dataset.created_at)
        }}</DescriptionListDetails>
      </div>
      <div v-if="harvestIssuedAt">
        <DescriptionListTerm>Publication</DescriptionListTerm>
        <DescriptionListDetails>{{
          formatDate(harvestIssuedAt)
        }}</DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>Dernière révision</DescriptionListTerm>
        <DescriptionListDetails>{{
          formatDate(harvestModifiedAt ?? dataset.last_update)
        }}</DescriptionListDetails>
      </div>
      <div v-if="dataset.frequency">
        <DescriptionListTerm>Fréquence</DescriptionListTerm>
        <DescriptionListDetails>{{
          dataset.frequency.label
        }}</DescriptionListDetails>
      </div>
      <div v-if="dataset.temporal_coverage">
        <DescriptionListTerm>Couverture temporelle</DescriptionListTerm>
        <DescriptionListDetails>
          <DateRangeDetails :range="dataset.temporal_coverage" />
        </DescriptionListDetails>
      </div>
    </dl>
  </div>
</template>

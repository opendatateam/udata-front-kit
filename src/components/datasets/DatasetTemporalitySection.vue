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
const createdAt = harvest ? harvest?.created_at : props.dataset.created_at
const issuedAt = harvest?.issued_at
const modifiedAt = harvest ? harvest?.modified_at : props.dataset.last_update
const modifiedLabel = harvest ? 'révision' : 'mise à jour'
</script>

<template>
  <div class="space-y-1 py-6">
    <h3 class="uppercase text-gray-plain text-sm font-bold">Temporalité</h3>
    <dl class="grid grid-cols-1 md:grid-cols-3 gap-6 p-0">
      <div v-if="createdAt">
        <DescriptionListTerm>Création</DescriptionListTerm>
        <DescriptionListDetails>{{
          formatDate(createdAt)
        }}</DescriptionListDetails>
      </div>
      <div v-if="issuedAt">
        <DescriptionListTerm>Publication</DescriptionListTerm>
        <DescriptionListDetails>{{
          formatDate(issuedAt)
        }}</DescriptionListDetails>
      </div>
      <div v-if="modifiedAt">
        <DescriptionListTerm>Dernière {{ modifiedLabel }}</DescriptionListTerm>
        <DescriptionListDetails>{{
          formatDate(modifiedAt)
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

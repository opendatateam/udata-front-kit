<template>
  <DsfrAccordionsGroup>
    <li v-for="(dataset, index) in datasets">
      <DsfrAccordion
        :title="dataset.label"
        :id="getAccordeonId(index)"
        :expanded-id="isExpanded[getAccordeonId(index)]"
        @expand="isExpanded[getAccordeonId(index)] = $event"
      >
        <DsfrTag
          v-if="!isAvailable(dataset)"
          class="fr-mb-2w uppercase bold"
          :label="`${dataset.availability}`"
        />
        <div>
          {{ dataset.purpose }}
        </div>
        <div class="button__wrapper">
          <DsfrButton
            icon="ri-delete-bin-line"
            label="Retirer de la section"
            class="fr-mr-2w"
            @click.prevent="this.$emit('removeDataset', index)"
          />
          <a
            v-if="!isAvailable(dataset)"
            class="fr-btn fr-btn--secondary inline-flex"
            :href="`mailto:${email}`"
          >
            Aidez-nous à trouver la donnée</a
          >
          <a
            v-if="dataset.uri"
            class="fr-btn fr-btn--secondary inline-flex"
            :href="dataset.uri"
            target="_blank"
            >Accéder au catalogue</a
          >
        </div>
      </DsfrAccordion>
    </li>
  </DsfrAccordionsGroup>
</template>

<script lang="ts">
import config from '@/config'
import { type DatasetProperties, Availability } from '@/model'

export default {
  name: 'DatasetList',
  emits: ['removeDataset'],
  props: {
    datasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  },
  data() {
    return {
      isExpanded: {}
    }
  },
  computed: {
    email() {
      return config.website.contact_email
    }
  },
  methods: {
    getAccordeonId(index: number): string {
      return `accordion_${index}`
    },
    isAvailable(dataset: DatasetProperties): boolean {
      return Availability.isAvailable(dataset.availability)
    }
  }
}
</script>

<template>
  <DsfrAccordionsGroup>
    <li v-for="(dataset, index) in datasets">
      <DsfrAccordion :title="dataset.label" :expanded-id="index.toString()">
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
            @click="remove(index)"
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
  props: {
    datasets: {
      type: Array<DatasetProperties>,
      default: []
    }
  },
  computed: {
    email() {
      return config.website.contact_email
    }
  },
  methods: {
    remove(index: number) {
      const updatedDatasets = this.datasets.splice(index, 1)
      this.$emit('update:datasets', updatedDatasets)
    },
    isAvailable(dataset: DatasetProperties): boolean {
      return Availability.isAvailable(dataset.availability)
    }
  }
}
</script>

<template>
  <div v-if="bouquets.length > 0">
    <p>{{ numberOfResultMsg }}</p>
    <div class="fr-grid-row fr-mb-1w">
      <DsfrButton
        class="fr-mb-1w"
        label="Ajouter un bouquet"
        icon="ri-add-circle-line"
        @click="goToCreate"
      />
    </div>
  </div>
  <div
    v-if="bouquets.length === 0"
    class="fr-alert fr-alert--info"
    data-fr-js-alert-actionee="true"
  >
    <h3 class="fr-alert__title">Il n'y a pas encore de bouquet sur ce thème</h3>
    <p>
      N'hésitez pas à contribuer en
      <a href="/admin/bouquets/add" target="_blank">en créant un</a>
    </p>
  </div>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-mt-1w">
      <li v-for="bouquet in bouquets" class="fr-col-12 fr-col-lg-6">
        <Tile
          :link="`/bouquets/${bouquet.slug}`"
          :title="bouquet.name"
          :description="bouquet.description"
          :is-markdown="true"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue'
import { useLoading } from 'vue-loading-overlay'

import type { BetaTopic } from '../model'
import { NoOptionSelected } from '../model'
import { useTopicStore } from '../store/TopicStore'
import Tile from './Tile.vue'

export default {
  name: 'TopicList',
  components: {
    Tile: Tile
  },
  setup() {
    onMounted(() => {
      const loader = useLoading().show()
      useTopicStore()
        .loadTopicsForUniverse()
        .finally(() => {
          loader.hide()
        })
    })
  },
  props: {
    themeName: {
      type: String,
      default: NoOptionSelected
    },
    subthemeName: {
      type: String,
      default: NoOptionSelected
    }
  },
  computed: {
    bouquets(): BetaTopic[] {
      const allTopics = useTopicStore().$state.data
      if (this.themeName === NoOptionSelected) {
        return allTopics
      }
      const relevantTopics: BetaTopic[] = []
      if (this.subthemeName !== NoOptionSelected) {
        for (const topic of allTopics) {
          if (
            this.isRelevant(topic, 'subtheme', this.subthemeName) &&
            this.isRelevant(topic, 'theme', this.themeName)
          ) {
            relevantTopics.push(topic)
          }
        }
      } else if (this.themeName !== NoOptionSelected) {
        for (const topic of allTopics) {
          if (this.isRelevant(topic, 'theme', this.themeName)) {
            relevantTopics.push(topic)
          }
        }
      }
      return relevantTopics
    },
    numberOfResultMsg(): string {
      if (this.bouquets.length === 1) {
        return '1 bouquet disponible'
      } else {
        return this.bouquets.length + ' bouquets disponibles'
      }
    }
  },
  methods: {
    isRelevant(topic: BetaTopic, property: string, value: string): Boolean {
      const topicInformations: { subtheme: string; theme: string }[] =
        topic.extras['ecospheres:informations']
      if (topicInformations) {
        for (const information of topicInformations) {
          if (information[property] === value) {
            return true
          }
        }
      }
      return false
    },
    goToCreate() {
      this.$router.push({ name: 'bouquet_add' })
    }
  }
}
</script>

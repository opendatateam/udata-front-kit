<template>
  <DsfrAlert
    v-if="bouquets.length === 0"
    type="info"
    title="Pas de résultat"
    description="Il n'y a pas encore de bouquets pour ces critères"
  />
  <p v-else>{{ numberOfResultMsg }}</p>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list fr-mt-1w">
      <li class="fr-col-12 fr-col-lg-6">
        <Tile
          className="actionTile"
          @click="goToCreate"
          link=""
          title="Ajouter un bouquet"
        />
      </li>
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

import type { Topic } from '../model'
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
    bouquets(): Topic[] {
      const allTopics = useTopicStore().$state.data
      if (this.themeName === NoOptionSelected) {
        return allTopics
      }
      const relevantTopics: Topic[] = []
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
    isRelevant(topic: Topic, property: string, value): Boolean {
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

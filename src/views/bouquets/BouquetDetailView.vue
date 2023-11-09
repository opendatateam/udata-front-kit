<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import config from '@/config'

import { useDatasetStore } from '../../store/DatasetStore'
import { useTopicStore } from '../../store/TopicStore'
import { useUserStore } from '../../store/UserStore'
import { descriptionFromMarkdown } from '../../utils'

const route = useRoute()
const router = useRouter()
const store = useTopicStore()
const userStore = useUserStore()
const datasetStore = useDatasetStore()
const bouquet = ref({})
const datasets = ref([])

const description = computed(() => descriptionFromMarkdown(bouquet))

const goToCreate = () => {
  router.push({ name: 'bouquet_add' })
}

const canCreate = computed(() => {
  return (
    userStore.isAdmin() ||
    (userStore.$state.isLoggedIn &&
      bouquet.value.owner?.id === userStore.$state.data?.id)
  )
})

onMounted(() => {
  store.load(route.params.bid).then((res) => {
    bouquet.value = res
    datasetStore
      .loadMultiple(bouquet.value.datasets.map((d) => d.id))
      .then((ds) => (datasets.value = ds))
  })
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <div class="bouquet__header fr-mb-4w">
      <div class="bouquet__header__left">
        <h3 class="fr-m-0">{{ bouquet.name }}</h3>
        <DsfrTag
          v-if="bouquet.extras"
          class="fr-ml-3w"
          :label="
            bouquet.extras[`${config.universe.name}:informations`][0].subtheme
          "
        />
      </div>
      <DsfrButton
        v-if="canCreate"
        label="Créer un bouquet"
        icon="ri-pencil-line"
        @click="goToCreate"
      />
    </div>
    <div class="bouquet__container fr-p-6w">
      <h5><strong>Objectif du bouquet</strong></h5>
      <div v-html="description" />
      <div
        v-if="
          bouquet.extras &&
          bouquet.extras[`${config.universe.name}:datasets_properties`]
        "
      >
        <h5>
          Données utilisées ({{
            bouquet.extras[`${config.universe.name}:datasets_properties`]
              .length
          }})
        </h5>
        <DsfrAccordionsGroup>
          <li
            v-for="property in bouquet.extras[
              `${config.universe.name}:datasets_properties`
            ]"
          >
            <DsfrAccordion
              :title="property.libelle"
              :expanded-id="property.id"
              @expand="property.id = $event"
            >
              <div class="fr-mb-3w">
                {{ property.raison }}
              </div>
              <a
                v-if="property.uri"
                class="fr-btn fr-btn--secondary block fr-ml-auto"
                :href="property.uri"
                target="_blank"
                >Accéder à la donnée</a
              >
            </DsfrAccordion>
          </li>
        </DsfrAccordionsGroup>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bouquet {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__left {
      display: flex;
      align-items: center;
    }
  }

  &__container {
    border: 1px solid var(--border-default-grey);

    :deep a {
      color: var(--text-action-high-blue-france);
    }
  }
}
</style>

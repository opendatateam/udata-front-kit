<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'

import NoResults from '@/components/NoResults.vue'
import type { TopicsQueryArgs } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { useTopicsConf } from '@/utils/config'

const router = useRouter()
const route = useRoute()
const topicStore = useTopicStore()

const { topicsName, topicsSlug } = useTopicsConf()

const userStore = useUserStore()
const { canAddBouquet } = storeToRefs(userStore)

const props = defineProps<TopicsQueryArgs>()

const emits = defineEmits(['clearFilters'])

const {
  topics: bouquets,
  pagination,
  total: nbBouquets
} = storeToRefs(topicStore)

const numberOfResultMsg: ComputedRef<string> = computed(() => {
  if (nbBouquets.value === 1) {
    return `1 ${topicsName} disponible`
  } else if (nbBouquets.value > 1) {
    return nbBouquets.value + ` ${topicsName}s disponibles`
  } else {
    return 'Aucun résultat ne correspond à votre recherche'
  }
})

const createUrl = computed(() => {
  return { name: `${topicsSlug}_add`, query: route.query }
})

const clearFilters = () => {
  const query: LocationQueryRaw = {}
  if (route.query.drafts) query.drafts = route.query.drafts
  router.push({ name: topicsSlug, query, hash: '#bouquets-list' }).then(() => {
    emits('clearFilters')
  })
}

const executeQuery = async (args: typeof props) => {
  const loader = useLoading().show({ enforceFocus: false })
  return topicStore.query(args).finally(() => loader.hide())
}

const goToPage = (page: number) => {
  router.push({
    name: topicsSlug,
    query: { ...route.query, page: page + 1 },
    hash: '#bouquets-list'
  })
}

const doSort = (value: string | null) => {
  router.push({
    name: topicsSlug,
    query: { ...route.query, sort: value },
    hash: '#bouquets-list'
  })
}

// launch search on props (~route.query) changes
watch(props, () => executeQuery(props), { immediate: true, deep: true })

defineExpose({
  numberOfResultMsg
})
</script>

<template>
  <template v-if="nbBouquets > 0">
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-2w"
    >
      <h2 class="fr-col-auto fr-my-0 h4">{{ numberOfResultMsg }}</h2>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <SelectComponent
          :model-value="sort"
          label="Trier par :"
          :label-class="['fr-col-auto', 'fr-text--sm', 'fr-m-0', 'fr-mr-1w']"
          :options="[
            { id: '-last_modified', name: 'Les plus récemment modifiés' },
            { id: '-created', name: 'Les plus récemment créés' },
            { id: 'name', name: 'Titre' }
          ]"
          @update:model-value="doSort"
        />
      </div>
    </div>
    <div class="fr-mb-4w border-top">
      <ul class="fr-grid-row flex-gap fr-mt-3w fr-pl-0" role="list">
        <li v-for="bouquet in bouquets" :key="bouquet.id" class="fr-col-12">
          <BouquetCard :bouquet="bouquet" />
        </li>
      </ul>
    </div>
    <DsfrPagination
      v-if="pagination.length"
      class="fr-container"
      :current-page="parseInt(page || '1') - 1"
      :pages="pagination"
      @update:current-page="goToPage"
    />
  </template>
  <NoResults v-else :clear-filters="clearFilters">
    <template #description>
      Essayez de réinitialiser les filtres pour agrandir votre champ de
      recherche.<br />
      Vous pouvez aussi contribuer en créant un {{ topicsName }}.
    </template>
    <template #actions>
      <router-link
        v-if="canAddBouquet"
        :to="createUrl"
        class="fr-btn fr-btn--secondary fr-ml-1w"
      >
        <VIconCustom name="add-circle-line" class="fr-mr-1v" />
        Ajouter un {{ topicsName }}
      </router-link>
    </template>
  </NoResults>
</template>

<style scoped>
.fr-grid-row {
  --gap: 1rem;
}
</style>

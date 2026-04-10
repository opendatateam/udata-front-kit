<script setup lang="ts">
import TopicCard from '@/components/topics/TopicCard.vue'
import VIconCustom from '@/components/VIconCustom.vue'
import { useCurrentPageConf } from '@/router/utils'
import { useUserStore } from '@/store/UserStore'
import { fromMarkdown } from '@/utils'
import { useAsyncComponent } from '@/utils/component'
import { useLabels } from '@/utils/labels'
import {
  DataserviceCard,
  DatasetCard,
  GlobalSearch,
  type Dataset,
  type TopicV2
} from '@datagouv/components-next'
import { useRoute, useRouter } from 'vue-router'

// Passed by the router props function; GlobalSearch reads state from the URL directly.
defineProps<{ query?: string; page?: string }>()

const route = useRoute()
const router = useRouter()
const { pageConf, pageKey } = useCurrentPageConf()

const organizationUrl = (id: string | undefined) =>
  router.hasRoute('organization_detail')
    ? { name: 'organization_detail', params: { oid: id } }
    : undefined
const userStore = useUserStore()
const labels = useLabels(pageConf.labels)

const links = [
  { to: '/', text: 'Accueil' },
  { text: pageConf.breadcrumb_title ?? pageConf.title }
]

const meta = route.meta
const CardComponent = useAsyncComponent(() => meta.cardComponent)
const createUrl = computed(() => ({
  name: `${pageKey}_add`,
  query: route.query
}))
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>

  <div class="fr-container fr-my-2v">
    <div class="fr-grid-row fr-grid-row--middle justify-between fr-mb-3w">
      <h1 class="fr-mb-0">{{ pageConf.title }}</h1>
      <div
        v-if="userStore.canAddTopic(pageKey)"
        class="fr-col-auto fr-grid-row fr-grid-row--middle"
      >
        <router-link :to="createUrl" class="fr-btn fr-mb-1w">
          <VIconCustom name="add-circle-line" class="fr-mr-1w" align="middle" />
          Ajouter {{ labels.articles.un }} {{ labels.singular }}
        </router-link>
      </div>
    </div>
  </div>

  <section
    v-if="pageConf.banner"
    class="fr-container--fluid hero-banner fr-mb-4w"
  >
    <div class="fr-container fr-py-12v">
      <!-- eslint-disable vue/no-v-html -->
      <h2
        :class="!pageConf.banner.content ? 'fr-mb-0' : ''"
        v-html="pageConf.banner.title"
      />
      <div
        v-if="pageConf.banner.content"
        v-html="fromMarkdown(pageConf.banner.content)"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>
  </section>

  <div class="fr-container fr-mb-4w">
    <Suspense>
      <GlobalSearch :config="meta.searchConfig!">
        <template #dataset="{ dataset }">
          <component
            :is="CardComponent ?? DatasetCard"
            :dataset="dataset"
            :dataset-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: dataset.id }
            }"
            :organization-url="
              organizationUrl((dataset as Dataset).organization?.id)
            "
          />
        </template>
        <template #dataservice="{ dataservice }">
          <component
            :is="CardComponent ?? DataserviceCard"
            :dataservice="dataservice"
            :dataservice-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: dataservice.id }
            }"
          />
        </template>
        <template #topic="{ topic }">
          <component
            :is="CardComponent ?? TopicCard"
            :topic="topic"
            :page-key="pageKey"
            :topic-url="{
              name: `${meta.pageKey}_detail`,
              params: { item_id: topic.slug }
            }"
            :organization-url="
              organizationUrl((topic as TopicV2).organization?.id)
            "
          />
        </template>
      </GlobalSearch>
    </Suspense>
  </div>
</template>

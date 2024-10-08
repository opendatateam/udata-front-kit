<script setup lang="ts">
import {
  OrganizationNameWithCertificate,
  ReadMore,
  excerpt
} from '@datagouv/components'
import { useHead } from '@unhead/vue'
import type { Ref } from 'vue'
import { computed, inject, ref, watch } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import ReusesList from '@/components/ReusesList.vue'
import BouquetDatasetList from '@/components/bouquets/BouquetDatasetList.vue'
import BouquetDatasetListExport from '@/components/bouquets/BouquetDatasetListExport.vue'
import config from '@/config'
import type { Topic } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import {
  updateTopicExtras,
  useBreadcrumbLinksForTopic,
  useExtras
} from '@/utils/bouquet'
import { useTopicsConf } from '@/utils/config'
import { useSpatialCoverage } from '@/utils/spatial'
import { useThemeOptions } from '@/utils/theme'

const props = defineProps({
  bouquetId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const store = useTopicStore()
const loading = useLoading()

const topic: Ref<Topic | null> = ref(null)
const selectedTabIndex = ref(0)
const spatialCoverage = useSpatialCoverage(topic)

const showDiscussions = config.website.discussions.topic.display

const setAccessibilityProperties = inject(
  'setAccessibilityProperties'
) as Function

const description = computed(() => descriptionFromMarkdown(topic))
const canEdit = computed(() => {
  return useUserStore().hasEditPermissions(topic.value)
})
const canClone = computed(() => useUserStore().isLoggedIn)

const {
  topicsListAll,
  topicsDisplayMetadata,
  topicsActivateReadMore,
  topicsDatasetEditorialization,
  topicsSlug,
  topicsName
} = useTopicsConf()

const { datasetsProperties, clonedFrom, theme, subtheme } = useExtras(topic)

const breadcrumbLinks = useBreadcrumbLinksForTopic(
  theme,
  subtheme,
  topic,
  topicsListAll
)

const { themeColors } = useThemeOptions(theme)

const goToEdit = () => {
  router.push({
    name: `${topicsSlug}_edit`,
    params: { bid: topic.value?.id }
  })
}

const goToClone = () => {
  router.push({
    name: `${topicsSlug}_add`,
    query: { clone: topic.value?.id }
  })
}

const togglePublish = () => {
  if (topic.value === null) return
  topic.value.private = !topic.value.private
  const loader = useLoading().show()
  store
    .update(topic.value.id, {
      tags: topic.value.tags,
      private: topic.value.private
    })
    .finally(() => loader.hide())
}

const onUpdateDatasets = () => {
  if (topic.value == null) {
    throw Error('Trying to update null topic')
  }
  const loader = useLoading().show()

  // Deduplicate datasets ids in case of same DS used multiple times
  // API rejects PUT if the same id is used more than once
  const dedupedDatasets = [
    ...new Set(
      datasetsProperties.value
        .filter((d) => d.id !== null && d.remoteDeleted !== true)
        .map((d) => d.id)
    )
  ]

  store
    .update(topic.value.id, {
      // send the tags or payload will be rejected
      tags: topic.value.tags,
      datasets: dedupedDatasets,
      extras: updateTopicExtras(topic.value, {
        datasets_properties: datasetsProperties.value.map(
          ({ remoteDeleted, archived, ...data }) => data
        )
      })
    })
    .finally(() => loader.hide())
}

const metaDescription = (): string | undefined => {
  return excerpt(topic.value?.description ?? '')
}

const metaTitle = (): string => {
  return `${topic.value?.name} | ${config.website.title}`
}

const metaLink = (): string => {
  const resolved = router.resolve({
    name: `${topicsSlug}_detail`,
    params: { bid: topic.value?.slug }
  })
  return `${window.location.origin}${resolved.href}`
}

useHead({
  title: metaTitle,
  meta: [
    { property: 'og:title', content: metaTitle },
    { name: 'description', content: metaDescription },
    { property: 'og:description', content: metaDescription }
  ],
  link: [{ rel: 'canonical', href: metaLink }]
})

watch(
  () => props.bouquetId,
  () => {
    const loader = loading.show({ enforceFocus: false })
    store
      .load(props.bouquetId, { toasted: false, redirectNotFound: true })
      .then((res) => {
        topic.value = res
        if (topic.value.slug !== props.bouquetId) {
          router.push({
            name: `${topicsSlug}_detail`,
            params: { bid: topic.value.slug }
          })
        }
        setAccessibilityProperties(topic.value.name)
      })
      .finally(() => loader.hide())
  },
  { immediate: true }
)
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbLinks" />
  </div>
  <GenericContainer v-if="topic">
    <div class="fr-grid-row fr-grid-row--gutters flex-reverse">
      <div
        class="fr-col-12"
        :class="
          topicsDisplayMetadata ? 'fr-col-md-4' : 'fr-col-md-12 flex-reverse'
        "
      >
        <div class="fr-mb-2w">
          <div v-if="!canEdit && topic.private" class="fr-mb-1w">
            <DsfrTag label="Brouillon" />
          </div>
          <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
            <DsfrButton
              v-if="canClone"
              :secondary="canEdit"
              size="md"
              label="Cloner"
              icon="ri-file-copy-2-line"
              title="Cloner le bouquet"
              class="fr-mb-1v fr-mr-1v"
              @click="goToClone"
            />
            <DsfrButton
              v-if="canEdit"
              secondary
              size="md"
              label="Éditer"
              icon="ri-pencil-line"
              class="fr-mb-1v fr-mr-1v"
              @click="goToEdit"
            />
            <DsfrButton
              v-if="canEdit"
              size="md"
              :label="topic.private ? 'Publier' : 'Dépublier'"
              icon="ri-eye-line"
              class="fr-mb-1v"
              @click="togglePublish"
            />
          </div>
        </div>
        <div v-if="topicsDisplayMetadata">
          <h2 id="producer" class="subtitle fr-mb-1v">Auteur</h2>
          <div
            v-if="topic.organization"
            class="fr-grid-row fr-grid-row--middle"
          >
            <div class="fr-col-auto fr-mr-1w">
              <OrganizationLogo :object="topic" />
            </div>
            <p class="fr-col fr-m-0">
              <a class="fr-link" :href="topic.organization.page">
                <OrganizationNameWithCertificate
                  :organization="topic.organization"
                />
              </a>
            </p>
          </div>
          <div v-else class="fr-grid-row fr-grid-row--middle">
            <div class="fr-col-auto">
              <div class="border fr-p-1-5v fr-mr-1-5v">
                <img
                  :src="getOwnerAvatar(topic)"
                  alt=""
                  loading="lazy"
                  class="owner-avatar"
                  height="32"
                  width="32"
                />
              </div>
            </div>
            <p class="fr-col fr-m-0">
              {{ topic.owner.first_name }} {{ topic.owner.last_name }}
            </p>
          </div>
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Création</h2>
          <time :datetime="topic.created_at">{{
            formatDate(topic.created_at)
          }}</time>
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
          <time :datetime="topic.last_modified">{{
            formatDate(topic.last_modified)
          }}</time>
          <div v-if="spatialCoverage">
            <h2 class="subtitle fr-mt-3v fr-mb-1v">Couverture territoriale</h2>
            <p>{{ spatialCoverage.name }}</p>
          </div>
          <div v-if="clonedFrom">
            <h2 class="subtitle fr-mt-3v fr-mb-1v">Cloné depuis</h2>
            <p>
              <RouterLink
                :to="{
                  name: `${topicsSlug}_detail`,
                  params: { bid: clonedFrom.slug }
                }"
              >
                {{ clonedFrom.name }}
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
      <div
        class="fr-col-12"
        :class="topicsDisplayMetadata ? 'fr-col-md-8' : 'fr-col-md-12'"
      >
        <div class="bouquet__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">{{ topic.name }}</h1>
          <DsfrTag v-if="theme" class="fr-mb-1v card__tag" :label="subtheme" />
        </div>
        <div v-if="topicsActivateReadMore">
          <ReadMore max-height="600">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="description"></div>
          </ReadMore>
        </div>
        <div v-else>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </div>
      </div>
    </div>

    <DsfrTabs
      class="fr-mt-2w"
      :tab-list-name="`Groupes d'attributs du ${topicsName}`"
      :tab-titles="[
        { title: 'Données' },
        { title: 'Discussions' },
        { title: 'Réutilisations' }
      ]"
      :initial-selected-index="0"
      :selected-tab-index="selectedTabIndex"
      @select-tab="(idx: number) => (selectedTabIndex = idx)"
    >
      <!-- Jeux de données -->
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <BouquetDatasetList
          v-model="datasetsProperties"
          :is-edit="canEdit"
          :dataset-editorialization="topicsDatasetEditorialization"
          @update-datasets="onUpdateDatasets"
        />
        <BouquetDatasetListExport
          :datasets="datasetsProperties"
          :filename="topic.id"
        />
      </DsfrTabContent>
      <!-- Discussions -->
      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
      >
        <DiscussionsList
          v-if="showDiscussions && topic"
          :subject="topic"
          subject-class="Topic"
        />
      </DsfrTabContent>
      <!-- Réutilisations -->
      <DsfrTabContent
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 2"
      >
        <ReusesList model="topic" :object-id="topic.id" />
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>

<style scoped lang="scss">
.bouquet {
  &__header {
    display: flex;
    align-items: center;
    flex-flow: wrap;
  }
}
.flex-reverse {
  display: flex;
  flex-direction: row-reverse;
}
.owner-avatar {
  margin-bottom: -6px;
}
.card__tag {
  color: v-bind('themeColors.color');
  background-color: v-bind('themeColors.background');
}
</style>

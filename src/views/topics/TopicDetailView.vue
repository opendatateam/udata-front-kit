<script setup lang="ts">
import { OrganizationNameWithCertificate, ReadMore } from '@datagouv/components'
import { useHead } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, inject, ref, watch } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import ReusesList from '@/components/ReusesList.vue'
import TagComponent from '@/components/TagComponent.vue'
import TopicFactorsList from '@/components/topics/TopicFactorsList.vue'
import TopicFactorsListExport from '@/components/topics/TopicFactorsListExport.vue'
import config from '@/config'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import type { Topic } from '@/model/topic'
import type { TopicPageRouterConf } from '@/router/model'
import {
  useCurrentPageConf,
  useRouteMeta,
  useRouteParamsAsString
} from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useSpatialCoverage } from '@/utils/spatial'
import { useTagsByRef } from '@/utils/tags'
import { useExtras, useTopicFactors } from '@/utils/topic'

const props = defineProps<TopicPageRouterConf>()

const router = useRouter()
const meta = useRouteMeta()
const { params } = useRouteParamsAsString()
const store = useTopicStore()
const loading = useLoading()

const topic: Ref<Topic | null> = ref(null)
const spatialCoverage = useSpatialCoverage(topic)
const showCloneModal = ref(false)
const cloneKeepDatasets = ref(false)

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const description = computed(() => descriptionFromMarkdown(topic))

// Dynamically load the custom description component if it exists
const customDescriptionComponent = computed(() => {
  if (meta.descriptionComponent) {
    return defineAsyncComponent(meta.descriptionComponent)
  }
  return null
})

const userStore = useUserStore()
const canEdit = computed(() => {
  return userStore.hasEditPermissions(topic.value) && pageConf.editable
})
const { isAdmin, canAddTopic } = storeToRefs(userStore)

const { pageKey, pageConf } = useCurrentPageConf()
const showDiscussions = pageConf.resources_tabs.discussions.display
const showDatasets = pageConf.resources_tabs.datasets.display
const showReuses = pageConf.resources_tabs.reuses.display
const tags = useTagsByRef(pageKey, topic)

const { clonedFrom } = useExtras(topic)
const { factors } = useTopicFactors(topic)

const breadcrumbLinks = computed(() => {
  const breadcrumbs = [{ to: '/', text: 'Accueil' }]
  if (pageConf.list_all === true) {
    breadcrumbs.push({
      to: `/${meta.pageKey || 'topics'}`,
      text: pageConf.breadcrumb_title || pageConf.title
    })
  }
  breadcrumbs.push({ to: '', text: topic.value?.name ?? '' })
  return breadcrumbs
})

const tabTitles: { title: string; tabId: string; panelId: string }[] = []
if (showDatasets) {
  tabTitles.push({
    title: 'Données',
    tabId: 'tab-datasets',
    panelId: 'tab-content-datasets'
  })
}
if (showDiscussions) {
  tabTitles.push({
    title: 'Discussions',
    tabId: 'tab-discussions',
    panelId: 'tab-content-discussions'
  })
}
if (showReuses) {
  tabTitles.push({
    title: 'Réutilisations',
    tabId: 'tab-reuses',
    panelId: 'tab-content-reuses'
  })
}

const activeTab = ref(0)

const cloneModalActions = [
  {
    label: 'Conserver les liens',
    onClick() {
      cloneKeepDatasets.value = true
      showCloneModal.value = false
      goToClone()
    }
  },
  {
    label: 'Supprimer les liens',
    secondary: true,
    onClick() {
      cloneKeepDatasets.value = false
      showCloneModal.value = false
      goToClone()
    }
  }
]

const goToEdit = () => {
  router.push({
    name: `${pageKey}_edit`,
    params: { item_id: topic.value?.id }
  })
}

const goToClone = () => {
  router.push({
    name: `${pageKey}_add`,
    query: {
      clone: topic.value?.id,
      'keep-datasets': cloneKeepDatasets.value ? '1' : '0'
    }
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

const toggleFeatured = () => {
  if (topic.value === null) return
  topic.value.featured = !topic.value.featured
  const loader = useLoading().show()
  store
    .update(topic.value.id, {
      tags: topic.value.tags,
      featured: topic.value.featured
    })
    .finally(() => loader.hide())
}

const onUpdateFactors = () => {
  if (topic.value == null) {
    throw Error('Trying to update null topic')
  }
  const loader = useLoading().show()
  store
    .update(topic.value.id, {
      // send the tags or payload will be rejected
      tags: topic.value.tags,
      elements: factors.value.map(
        // unresolved will remove "local" properties
        (element) => element.unresolved()
      )
    })
    .finally(() => loader.hide())
}

const metaDescription = (): string | undefined => {
  return topic.value?.description ?? ''
}

const metaTitle = computed(() => {
  return topic.value?.name
})

const metaLink = (): string => {
  const resolved = router.resolve({
    name: `${pageKey}_detail`,
    params: { item_id: topic.value?.slug }
  })
  return `${window.location.origin}${resolved.href}`
}

useHead({
  meta: [
    {
      property: 'og:title',
      content: () => `${metaTitle.value} | ${config.website.title}`
    },
    { name: 'description', content: metaDescription },
    { property: 'og:description', content: metaDescription }
  ],
  link: [{ rel: 'canonical', href: metaLink }]
})

watch(
  () => params.item_id,
  () => {
    const loader = loading.show({ enforceFocus: false })
    store
      .load(params.item_id, { toasted: false, redirectNotFound: true })
      .then((res) => {
        topic.value = res
        if (topic.value.slug !== params.item_id) {
          router.push({
            name: `${pageKey}_detail`,
            params: { item_id: topic.value.slug }
          })
        }
        setAccessibilityProperties(metaTitle.value)
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
    <div class="fr-mt-1w fr-grid-row fr-grid-row--gutters test__topic-detail">
      <div
        class="fr-col-12"
        :class="props.displayMetadata ? 'fr-col-md-8' : 'fr-col-md-12'"
      >
        <!-- Use custom description component if defined, otherwise fallback to default HTML -->
        <div v-if="meta.descriptionComponent && customDescriptionComponent">
          <component
            :is="customDescriptionComponent"
            :topic="topic"
            :page-key="pageKey"
          />
        </div>
        <div v-else>
          <div class="topic__header fr-mb-4v">
            <h1 class="fr-mb-1v fr-mr-2v">{{ topic.name }}</h1>
            <ul v-if="tags.length > 0" class="fr-badges-group">
              <li v-for="t in tags" :key="`${t.type}-${t.id}`">
                <TagComponent :tag="t" />
              </li>
            </ul>
          </div>

          <div v-if="props.enableReadMore">
            <ReadMore max-height="600">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="description" />
            </ReadMore>
          </div>
          <div v-else>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="description" />
          </div>
        </div>
      </div>
      <div
        class="fr-col-12"
        :class="
          props.displayMetadata ? 'fr-col-md-4' : 'fr-col-md-12 flex-reverse'
        "
      >
        <div class="fr-mb-2w">
          <div v-if="!canEdit && topic.private" class="fr-mb-1w">
            <DsfrTag label="Brouillon" />
          </div>
          <div
            class="fr-mt-1v fr-col-auto fr-grid-row fr-grid-row--middle flex-gap"
          >
            <DsfrButton
              v-if="canAddTopic"
              secondary
              size="md"
              label="Cloner"
              icon="fr-icon-git-merge-line"
              :title="`Cloner le ${pageConf.labels.singular}`"
              @click="showCloneModal = true"
            />
            <DsfrModal
              v-model:opened="showCloneModal"
              title="Cloner en conservant les jeux de données&nbsp;?"
              :is-alert="false"
              :actions="cloneModalActions"
              @close="showCloneModal = false"
            >
              <template #default>
                <p>
                  Vous pouvez choisir de conserver les liens vers les jeux de
                  données du {{ pageConf.labels.singular }} que vous souhaitez
                  cloner.
                </p>
                <p>
                  Si vous ne conservez pas les liens, les jeux de données ne
                  seront pas ajoutés au {{ pageConf.labels.singular }} cloné,
                  mais leurs libellés et raisons d'utilisation seront conservés.
                </p>
                <p>
                  Voulez-vous conserver les liens vers les jeux de
                  données&nbsp;?
                </p>
              </template>
            </DsfrModal>
            <DsfrButton
              v-if="canEdit"
              secondary
              size="md"
              label="Éditer"
              icon="fr-icon-pencil-line"
              class="fr-mb-1v fr-mr-1v"
              @click="goToEdit"
            />
            <DsfrButton
              v-if="canEdit"
              size="md"
              :label="topic.private ? 'Publier' : 'Dépublier'"
              :icon="
                topic.private ? 'fr-icon-eye-line' : 'fr-icon-eye-off-line'
              "
              class="fr-mb-1v"
              @click="togglePublish"
            />
            <DsfrButton
              v-if="isAdmin"
              secondary
              size="md"
              :label="
                topic.featured ? 'Ne plus mettre en avant' : 'Mettre en avant'
              "
              :icon="
                topic.featured ? 'fr-icon-dislike-line' : 'fr-icon-heart-line'
              "
              class="fr-mb-1v"
              @click="toggleFeatured"
            />
          </div>
        </div>
        <div v-if="props.displayMetadata">
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
                  name: `${pageKey}_detail`,
                  params: { item_id: clonedFrom.slug }
                }"
              >
                {{ clonedFrom.name }}
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>

    <DsfrTabs
      v-if="tabTitles.length > 0"
      v-model="activeTab"
      class="fr-mt-2w"
      :tab-titles="tabTitles"
      :tab-list-name="`Groupes d'attributs du ${pageConf.labels.singular}`"
    >
      <!-- Jeux de données -->
      <DsfrTabContent
        v-if="showDatasets"
        panel-id="tab-content-datasets"
        tab-id="tab-datasets"
        class="fr-px-2w"
      >
        <TopicFactorsList
          v-model="factors"
          :is-edit="canEdit"
          :dataset-editorialization="props.datasetEditorialization"
          @update-factors="onUpdateFactors"
        />
        <TopicFactorsListExport :factors="factors" :filename="topic.id" />
      </DsfrTabContent>
      <!-- Discussions -->
      <DsfrTabContent
        v-if="showDiscussions && topic"
        panel-id="tab-content-discussions"
        tab-id="tab-discussions"
      >
        <DiscussionsList
          :subject="topic"
          subject-class="Topic"
          :empty-message="`Pas de discussion pour ce ${pageConf.labels.singular}.`"
        />
      </DsfrTabContent>
      <!-- Réutilisations -->
      <DsfrTabContent
        v-if="showReuses"
        panel-id="tab-content-reuses"
        tab-id="tab-reuses"
      >
        <ReusesList model="topic" :object-id="topic.id" />
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>

<style scoped>
.topic__header {
  display: flex;
  align-items: center;
  flex-flow: wrap;
}

.flex-reverse {
  display: flex;
  flex-direction: row-reverse;
}
.owner-avatar {
  margin-bottom: -6px;
}
/*
FIXME: magic calc to fix the tabs height bug https://github.com/opendatateam/udata-front-kit/pull/621#issuecomment-2551404580
*/
:deep(.fr-tabs) {
  height: auto;
}
:deep(.fr-tabs)::before {
  height: calc(var(--tabs-height) - 47px);
}
</style>

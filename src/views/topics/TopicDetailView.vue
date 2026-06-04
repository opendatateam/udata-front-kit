<script setup lang="ts">
import {
  OrganizationNameWithCertificate,
  ReadMore
} from '@datagouv/components-next'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { capitalize, computed, nextTick, ref, watch, watchEffect } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import ContentPlaceholder from '@/components/ContentPlaceholder.vue'
import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import SidebarItem from '@/components/SidebarItem.vue'
import SidebarList from '@/components/SidebarList.vue'
import TagComponent from '@/components/TagComponent.vue'
import TopicActivityList from '@/components/topics/TopicActivityList.vue'
import TopicFactorsList from '@/components/topics/TopicFactorsList.vue'
import TopicFactorsListExport from '@/components/topics/TopicFactorsListExport.vue'
import TopicReusesList from '@/components/topics/TopicReusesList.vue'
import config from '@/config'
import type { Topic } from '@/model/topic'
import type { TopicPageRouterConf } from '@/router/model'
import {
  useCurrentPageConf,
  useRouteMeta,
  useRouteParamsAsStringReactive
} from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useAsyncComponent } from '@/utils/component'
import { useLabels } from '@/utils/labels'
import { useCanonicalUrl, useMeta } from '@/utils/seo'
import { useSpatialCoverage } from '@/utils/spatial'
import { useTagsByRef } from '@/utils/tags'
import { useExtras, useTopicFactors } from '@/utils/topic'

const props = defineProps<TopicPageRouterConf>()

const router = useRouter()
const meta = useRouteMeta()
const store = useTopicStore()
const loading = useLoading()
const route = useRouteParamsAsStringReactive()

const topic: Ref<Topic | null> = ref(null)
const spatialCoverage = useSpatialCoverage(topic)
const showCloneModal = ref(false)
const cloneKeepDatasets = ref(false)

const description = computed(() => descriptionFromMarkdown(topic))

// Dynamically load the custom description component if it exists
const customDescriptionComponent = useAsyncComponent(
  () => meta.descriptionComponent,
  { loadingComponent: ContentPlaceholder }
)

const userStore = useUserStore()
const canEdit = computed(() => {
  return userStore.hasEditPermissions(topic.value) && pageConf.editable
})
const { isAdmin } = storeToRefs(userStore)

const { pageKey, pageConf } = useCurrentPageConf()
const labels = useLabels(pageConf.labels)
const showDiscussions = pageConf.resources_tabs.discussions.display
const showDatasets = pageConf.resources_tabs.datasets.display
const showReuses = pageConf.resources_tabs.reuses.display
const tags = useTagsByRef(pageKey, topic)

const { clonedFrom } = useExtras(topic)
const { factors } = useTopicFactors(topic)
const topicFactorsListRef = ref<InstanceType<typeof TopicFactorsList> | null>(
  null
)
const topicActivityListRef = ref<InstanceType<typeof TopicActivityList> | null>(
  null
)

const handleFactorChanged = () => {
  // Refresh activity list when factors are added, modified, or deleted
  topicActivityListRef.value?.refreshActivityList()
}

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

const showActivity = computed(() => canEdit.value)

const tabTitles = computed(() => {
  const tabs: { title: string; tabId: string; panelId: string }[] = []

  if (showDatasets) {
    tabs.push({
      title: 'Données',
      tabId: 'tab-datasets',
      panelId: 'tab-content-datasets'
    })
  }
  if (showDiscussions) {
    tabs.push({
      title: 'Discussions',
      tabId: 'tab-discussions',
      panelId: 'tab-content-discussions'
    })
  }
  if (showReuses) {
    tabs.push({
      title: 'Réutilisations',
      tabId: 'tab-reuses',
      panelId: 'tab-content-reuses'
    })
  }
  if (showActivity.value) {
    tabs.push({
      title: 'Activité',
      tabId: 'tab-activity',
      panelId: 'tab-content-activity'
    })
  }

  return tabs
})

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

const metaTitle = computed(() => {
  return topic.value?.name
})

const handleNavigateToFactor = (elementId: string) => {
  activeTab.value = 0
  nextTick(() => {
    topicFactorsListRef.value?.navigateToElement(elementId)
  })
}

useMeta({
  title: () =>
    metaTitle.value && `${capitalize(labels.singular)} - ${metaTitle.value}`,
  description: () => topic.value?.description,
  keywords: () => {
    const tags = topic.value?.tags
    if (!tags?.length) return undefined
    const prefix = pageConf.filter_prefix
    return prefix ? tags.filter((t) => !t.startsWith(prefix)) : tags
  },
  canonicalUrl: useCanonicalUrl(() => {
    const slug = topic.value?.slug
    if (!slug) return null
    return { name: `${pageKey}_detail`, params: { item_id: slug } }
  }),
  noIndex: () => topic.value?.private
})

// Handle factor deeplinks: #factor-{id} switches to Données tab and scrolls to factor
watch(
  () => router.currentRoute.value.hash,
  (hash) => {
    if (hash.startsWith('#factor-')) {
      activeTab.value = 0
      const elementId = hash.replace('#factor-', '')

      // Wait for component and data to be ready before navigating
      let stopWatching: (() => void) | undefined = undefined
      stopWatching = watchEffect(() => {
        if (topicFactorsListRef.value && factors.value.length > 0) {
          nextTick(() => {
            topicFactorsListRef.value?.navigateToElement(elementId)
          })
          stopWatching?.()
        }
      })

      // Clear hash immediately using replaceState to avoid adding history entry
      // and to avoid interfering with navigateToElement's scroll behavior
      // TODO: proper way would be implement deeplinking for tabs
      const url = new URL(window.location.href)
      url.hash = ''
      window.history.replaceState(window.history.state, '', url.toString())
    }
  },
  { immediate: true }
)

// Callback to hide the loader, passed to custom description components
const hideLoader = ref<(() => void) | null>(null)

watch(
  () => route.value?.params.item_id,
  (itemId) => {
    if (!itemId) return
    const loader = loading.show({ enforceFocus: false })
    hideLoader.value = () => loader.hide()
    store
      .load(itemId, { toasted: false, redirectNotFound: true })
      .then((res) => {
        topic.value = res
        if (topic.value.slug !== itemId) {
          router.push({
            name: `${pageKey}_detail`,
            params: { item_id: topic.value.slug }
          })
        }
      })
      .finally(() => {
        // Only auto-hide if there's no custom description component
        // Custom components are responsible for calling hideLoader when ready
        if (!meta.descriptionComponent) {
          loader.hide()
        }
      })
  },
  { immediate: true }
)
</script>

<template>
  <div class="fr-container fr-grid-row fr-grid-row--middle fr-mt-1v">
    <div class="fr-col">
      <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbLinks" />
    </div>
    <div
      v-if="topic && (userStore.canAddTopic(pageKey) || canEdit || isAdmin)"
      class="fr-col-auto fr-grid-row fr-grid-row--middle flex-gap"
    >
      <DsfrButton
        v-if="userStore.canAddTopic(pageKey)"
        secondary
        size="sm"
        label="Cloner"
        icon="fr-icon-git-merge-line"
        :title="`Cloner ${labels.articles.le} ${labels.singular}`"
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
            Vous pouvez choisir de conserver les liens vers les jeux de données
            {{ labels.articles.du }} {{ labels.singular }} que vous souhaitez
            cloner.
          </p>
          <p>
            Si vous ne conservez pas les liens, les jeux de données ne seront
            pas ajoutés {{ labels.articles.au }} {{ labels.singular }} cloné,
            mais leurs libellés et raisons d'utilisation seront conservés.
          </p>
          <p>Voulez-vous conserver les liens vers les jeux de données&nbsp;?</p>
        </template>
      </DsfrModal>
      <DsfrButton
        v-if="canEdit"
        size="sm"
        :label="topic.private ? 'Publier' : 'Dépublier'"
        :icon="topic.private ? 'fr-icon-eye-line' : 'fr-icon-eye-off-line'"
        @click="togglePublish"
      />
      <DsfrButton
        v-if="canEdit"
        secondary
        size="sm"
        label="Modifier"
        icon="fr-icon-pencil-line"
        @click="goToEdit"
      />
    </div>
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
            :key="topic.id"
            :topic="topic"
            :page-key="pageKey"
            :hide-loader="hideLoader"
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
        <div v-if="!canEdit && topic.private" class="fr-mb-2w">
          <DsfrTag label="Brouillon" />
        </div>
        <SidebarList v-if="props.displayMetadata">
          <SidebarItem id="producer" term="Auteur">
            <div
              v-if="topic.organization"
              class="fr-grid-row fr-grid-row--middle"
            >
              <div class="fr-col-auto fr-mr-1w">
                <OrganizationLogo :object="topic" />
              </div>
              <p class="fr-col fr-m-0 min-width-0">
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
          </SidebarItem>
          <SidebarItem class="fr-mt-3v" term="Création">
            <time :datetime="topic.created_at">{{
              formatDate(topic.created_at)
            }}</time>
          </SidebarItem>
          <SidebarItem class="fr-mt-3v" term="Dernière mise à jour">
            <time :datetime="topic.last_modified">{{
              formatDate(topic.last_modified)
            }}</time>
          </SidebarItem>
          <SidebarItem
            v-if="spatialCoverage"
            class="fr-mt-3v"
            term="Couverture territoriale"
          >
            {{ spatialCoverage.name }}
          </SidebarItem>
          <SidebarItem v-if="clonedFrom" class="fr-mt-3v" term="Cloné depuis">
            <RouterLink
              :to="{
                name: `${pageKey}_detail`,
                params: { item_id: clonedFrom.slug }
              }"
            >
              {{ clonedFrom.name }}
            </RouterLink>
          </SidebarItem>
        </SidebarList>
      </div>
    </div>

    <DsfrTabs
      v-if="tabTitles.length > 0"
      v-model="activeTab"
      class="fr-mt-2w"
      :tab-titles="tabTitles"
      :tab-list-name="`Groupes d'attributs ${labels.articles.du} ${labels.singular}`"
    >
      <!-- Jeux de données -->
      <DsfrTabContent
        v-if="showDatasets"
        panel-id="tab-content-datasets"
        tab-id="tab-datasets"
        class="fr-px-2w"
      >
        <TopicFactorsList
          ref="topicFactorsListRef"
          v-model="factors"
          :is-edit="canEdit"
          :topic-id="topic.id"
          :topic-name="topic.name"
          @factor-changed="handleFactorChanged"
        />
        <TopicFactorsListExport
          :factors="factors"
          :filename="topic.id"
          :has-ogc-resources="
            topicFactorsListRef?.hasOgcResources &&
            config.website.datasets.open_in_qgis
          "
          @open-topic-in-qgis="topicFactorsListRef?.handleOpenTopicInQgis"
        />
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
          :empty-message="`Il n'y a pas encore de discussion pour ${labels.articles.ce} ${labels.singular}.`"
        />
      </DsfrTabContent>
      <!-- Réutilisations -->
      <DsfrTabContent
        v-if="showReuses"
        panel-id="tab-content-reuses"
        tab-id="tab-reuses"
      >
        <TopicReusesList :topic="topic" />
      </DsfrTabContent>
      <!-- Activité -->
      <DsfrTabContent
        v-if="showActivity"
        panel-id="tab-content-activity"
        tab-id="tab-activity"
      >
        <TopicActivityList
          ref="topicActivityListRef"
          :topic
          :factors
          @navigate-to-factor="handleNavigateToFactor"
        />
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
</style>

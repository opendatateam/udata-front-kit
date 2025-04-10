<script setup lang="ts">
import { OrganizationNameWithCertificate, ReadMore } from '@datagouv/components'
import { useHead } from '@unhead/vue'
import type { Ref } from 'vue'
import { capitalize, computed, inject, ref, watch } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import ReusesList from '@/components/ReusesList.vue'
import TagComponent from '@/components/TagComponent.vue'
import TopicDatasetList from '@/components/topics/TopicDatasetList.vue'
import TopicDatasetListExport from '@/components/topics/TopicDatasetListExport.vue'
import config from '@/config'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import type { Topic } from '@/model/topic'
import type { TopicPageRouterConf } from '@/router/utils'
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
import { updateTopicExtras, useExtras } from '@/utils/topic'

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

const showDiscussions = config.website.discussions.topic.display

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const description = computed(() => descriptionFromMarkdown(topic))
const canEdit = computed(() => {
  return useUserStore().hasEditPermissions(topic.value)
})
const canClone = computed(() => useUserStore().isLoggedIn)

const { pageKey, pageConf } = useCurrentPageConf()
const tags = useTagsByRef(pageKey, topic)

const { datasetsProperties, clonedFrom } = useExtras(topic)

const breadcrumbLinks = computed(() => {
  const breadcrumbs = [{ to: '/', text: 'Accueil' }]
  if (props.listAll === true) {
    breadcrumbs.push({
      to: `/${meta.pageKey || 'topics'}`,
      text: `${capitalize(pageConf.object.plural)}`
    })
  }
  breadcrumbs.push({ to: '', text: topic.value?.name ?? '' })
  return breadcrumbs
})

const tabTitles = [
  { title: 'Données', tabId: 'tab-0', panelId: 'tab-content-0' },
  { title: 'Discussions', tabId: 'tab-1', panelId: 'tab-content-1' },
  { title: 'Réutilisations', tabId: 'tab-2', panelId: 'tab-content-2' }
]
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
          ({ isHidden, remoteDeleted, remoteArchived, ...data }) => data
        )
      })
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
    <div class="fr-mt-1w fr-grid-row fr-grid-row--gutters">
      <div
        class="fr-col-12"
        :class="props.displayMetadata ? 'fr-col-md-8' : 'fr-col-md-12'"
      >
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
              v-if="canClone"
              :secondary="canEdit"
              size="md"
              label="Cloner"
              icon="fr-icon-git-merge-line"
              title="Cloner le bouquet"
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
                  données du {{ pageConf.object.singular }} que vous souhaitez
                  cloner.
                </p>
                <p>
                  Si vous ne conservez pas les liens, les jeux de données ne
                  seront pas ajoutés au nouveau {{ pageConf.object.singular }},
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
      v-model="activeTab"
      class="fr-mt-2w"
      :tab-titles="tabTitles"
      :tab-list-name="`Groupes d'attributs du ${pageConf.object.singular}`"
    >
      <!-- Jeux de données -->
      <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0" class="fr-px-2w">
        <TopicDatasetList
          v-model="datasetsProperties"
          :is-edit="canEdit"
          :dataset-editorialization="props.datasetEditorialization"
          @update-datasets="onUpdateDatasets"
        />
        <TopicDatasetListExport
          :datasets="datasetsProperties"
          :filename="topic.id"
        />
      </DsfrTabContent>
      <!-- Discussions -->
      <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1">
        <DiscussionsList
          v-if="showDiscussions && topic"
          :subject="topic"
          subject-class="Topic"
        />
      </DsfrTabContent>
      <!-- Réutilisations -->
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
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

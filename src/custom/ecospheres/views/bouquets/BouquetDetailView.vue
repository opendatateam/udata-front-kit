<script setup lang="ts">
import {
  ReadMore,
  OrganizationNameWithCertificate,
  excerpt
} from '@etalab/data.gouv.fr-components'
import { useHead } from '@unhead/vue'
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import DiscussionsList from '@/components/DiscussionsList.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import ReusesList from '@/components/ReusesList.vue'
import config from '@/config'
import BouquetDatasetList from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import type { Topic, DatasetProperties } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useSpatialCoverage } from '@/utils/spatial'
import { getThemeTextColor, getThemeColor } from '@/utils/theme'
import { useClonedFrom } from '@/utils/topic'

import BouquetDatasetListExport from '../../components/BouquetDatasetListExport.vue'

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
const theme = ref()
const subtheme = ref()
const selectedTabIndex = ref(0)
const breadcrumbLinks = ref([
  {
    to: '/',
    text: 'Accueil'
  },
  {
    to: { name: 'bouquets' },
    text: 'Bouquets'
  }
])
const spatialCoverage = useSpatialCoverage(topic)
const clonedFrom = useClonedFrom(topic)
const datasetsProperties: Ref<DatasetProperties[]> = ref([])

const showDiscussions = config.website.discussions.topic.display

const description = computed(() => descriptionFromMarkdown(topic))

const canEdit = computed(() => {
  return useUserStore().hasEditPermissions(topic.value)
})
const canClone = computed(() => useUserStore().isLoggedIn)

const goToEdit = () => {
  router.push({ name: 'bouquet_edit', params: { bid: topic.value?.id } })
}

const goToClone = () => {
  router.push({ name: 'bouquet_add', query: { clone: topic.value?.id } })
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
  store
    .update(topic.value.id, {
      // send the tags or they will be erased
      tags: topic.value.tags,
      datasets: datasetsProperties.value
        .filter((d) => d.id !== null)
        .map((d) => d.id),
      extras: {
        ...topic.value.extras,
        'ecospheres:datasets_properties': datasetsProperties.value
      }
    })
    .finally(() => loader.hide())
}

const metaDescription = (): string | undefined => {
  return excerpt(topic.value?.description ?? '')
}

const metaTitle = (): string => {
  return `${topic.value?.name ?? ''} - ${config.website.title}`
}

const metaLink = (): string => {
  const resolved = router.resolve({
    name: 'bouquet_detail',
    params: { bid: topic.value?.id }
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
    const loader = loading.show()
    store
      .load(props.bouquetId)
      .then((res) => {
        topic.value = res
        // FIXME: use extras value directly when new schema is here or a composable
        theme.value = topic.value?.extras['ecospheres:informations'][0].theme
        subtheme.value =
          topic.value?.extras['ecospheres:informations'][0].subtheme
        datasetsProperties.value =
          res.extras['ecospheres:datasets_properties'] ?? []
        // FIXME: use computed from extras when new schema is here
        breadcrumbLinks.value.push(
          {
            text: theme.value,
            to: `/bouquets/?theme=${theme.value}`
          },
          {
            text: subtheme.value,
            to: `/bouquets/?theme=${theme.value}&subtheme=${subtheme.value}`
          },
          {
            to: '',
            text: topic.value?.name ?? ''
          }
        )
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
  <div v-if="topic" class="fr-container datagouv-components fr-mb-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <div class="bouquet__header fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">{{ topic.name }}</h1>
          <DsfrTag
            v-if="topic?.extras"
            class="fr-mb-1v bold uppercase"
            :label="subtheme"
            :style="{
              backgroundColor: getThemeColor(theme),
              color: getThemeTextColor(theme)
            }"
          />
        </div>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <div class="fr-col-12 fr-col-md-4">
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
        <h2 id="producer" class="subtitle fr-mb-1v">Auteur</h2>
        <div v-if="topic.organization" class="fr-grid-row fr-grid-row--middle">
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
                style="margin-bottom: -6px"
                :src="getOwnerAvatar(topic)"
                height="32"
              />
            </div>
          </div>
          <p class="fr-col fr-m-0">
            {{ topic.owner.first_name }} {{ topic.owner.last_name }}
          </p>
        </div>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Création</h2>
        <p>{{ formatDate(topic.created_at) }}</p>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
        <p>{{ formatDate(topic.last_modified) }}</p>
        <div v-if="spatialCoverage">
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Couverture territoriale</h2>
          <p>{{ spatialCoverage.name }}</p>
        </div>
        <div v-if="clonedFrom">
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Cloné depuis</h2>
          <p>
            <RouterLink
              :to="{ name: 'bouquet_detail', params: { bid: clonedFrom.slug } }"
            >
              {{ clonedFrom.name }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>

    <DsfrTabs
      class="fr-mt-2w"
      tab-list-name="Groupes d'attributs du bouquet"
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
  </div>
</template>

<style scoped lang="scss">
.bouquet {
  &__header {
    display: flex;
    align-items: center;
    flex-flow: wrap;
  }
}
</style>

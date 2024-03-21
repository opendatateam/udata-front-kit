<script setup lang="ts">
import {
  ReadMore,
  OrganizationNameWithCertificate
} from '@etalab/data.gouv.fr-components'
import { onMounted, ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import DiscussionsList from '@/components/DiscussionsList.vue'
import config from '@/config'
import BouquetDatasetList, {
  getDatasetListTitle
} from '@/custom/ecospheres/components/BouquetDatasetList.vue'
import type { Theme, Topic, DatasetProperties } from '@/model'
import { useRouteParamsAsString } from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { getOwnerAvatar } from '@/utils/avatar'
import { useSpatialCoverage } from '@/utils/spatial'

const route = useRouteParamsAsString()
const router = useRouter()
const store = useTopicStore()
const loading = useLoading()

const bouquet: Ref<Topic | null> = ref(null)
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
const selectedTheme = ref('')
const spatialCoverage = useSpatialCoverage(bouquet)

const showDiscussions = config.website.discussions.topic.display

const description = computed(() => descriptionFromMarkdown(bouquet))

const canEdit = computed(() => {
  return useUserStore().hasEditPermissions(bouquet.value as Topic)
})

const datasetsProperties = computed((): DatasetProperties[] => {
  return bouquet.value?.extras['ecospheres:datasets_properties'] ?? []
})

const goToEdit = () => {
  router.push({ name: 'bouquet_edit', params: { bid: bouquet.value?.id } })
}

const getTheme = (themeName: string): Theme => {
  return config.themes.find((theme: Theme) => theme.name === themeName)
}

const convertToHex = (hex: string): string => {
  return `#${parseInt(hex, 16).toString(16).padStart(6, '0')}`
}

const getThemeColor = (themeName: string): string => {
  const theme = getTheme(themeName)
  return theme.color ? convertToHex(theme.color) : 'transparent'
}

const getTextColor = (themeName: string): string => {
  const theme = getTheme(themeName)
  return theme.textColor ? convertToHex(theme.textColor) : '#000000b3'
}

const getSelectedThemeColor = (themed: string) => {
  selectedTheme.value = themed
  return getThemeColor(selectedTheme.value)
}

onMounted(() => {
  const loader = loading.show()
  store
    .load(route.params.bid)
    .then((res) => {
      bouquet.value = res
      theme.value = bouquet.value?.extras['ecospheres:informations'][0].theme
      subtheme.value =
        bouquet.value?.extras['ecospheres:informations'][0].subtheme

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
          text: bouquet.value?.name ?? ''
        }
      )
    })
    .finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbLinks" />
  </div>
  <div v-if="bouquet" class="fr-container datagouv-components fr-mb-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <div class="bouquet__header fr-mb-2v">
          <h1 class="fr-mb-2v fr-mr-2v">{{ bouquet.name }}</h1>
          <DsfrTag
            v-if="bouquet?.extras"
            class="fr-mb-2w fr-mb-md-0 bold uppercase"
            :label="subtheme"
            :style="{
              backgroundColor: getSelectedThemeColor(theme),
              color: getTextColor(theme)
            }"
          />
        </div>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <div class="fr-col-12 fr-col-md-4">
        <h2 id="producer" class="subtitle fr-mb-1v">Auteur</h2>
        <div
          v-if="bouquet.organization"
          class="fr-grid-row fr-grid-row--middle"
        >
          <div class="fr-col-auto">
            <div class="border fr-p-1-5v fr-mr-1-5v">
              <img :src="bouquet.organization.logo" height="32" />
            </div>
          </div>
          <p class="fr-col fr-m-0">
            <a class="fr-link" :href="bouquet.organization.page">
              <OrganizationNameWithCertificate
                :organization="bouquet.organization"
              />
            </a>
          </p>
        </div>
        <div v-else class="fr-grid-row fr-grid-row--middle">
          <div class="fr-col-auto">
            <div class="border fr-p-1-5v fr-mr-1-5v">
              <img
                style="margin-bottom: -6px"
                :src="getOwnerAvatar(bouquet)"
                height="32"
              />
            </div>
          </div>
          <p class="fr-col fr-m-0">
            {{ bouquet.owner.first_name }} {{ bouquet.owner.last_name }}
          </p>
        </div>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Création</h2>
        <p>{{ formatDate(bouquet.created_at) }}</p>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
        <p>{{ formatDate(bouquet.last_modified) }}</p>
        <div v-if="spatialCoverage">
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Couverture territoriale</h2>
          <p>{{ spatialCoverage.name }}</p>
        </div>
        <DsfrButton
          v-if="canEdit"
          size="md"
          label="Editer le bouquet"
          icon="ri-pencil-line"
          @click="goToEdit"
        />
      </div>
    </div>

    <DsfrTabs
      class="fr-mt-2w"
      tab-list-name="Groupes d'attributs du bouquet"
      :tab-titles="[{ title: 'Données' }, { title: 'Discussions' }]"
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
        <h2>{{ getDatasetListTitle(datasetsProperties) }}</h2>
        <BouquetDatasetList :datasets="datasetsProperties" />
      </DsfrTabContent>
      <!-- Discussions -->
      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
      >
        <DiscussionsList
          v-if="showDiscussions && bouquet"
          :subject="bouquet"
          subject-class="Topic"
        />
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

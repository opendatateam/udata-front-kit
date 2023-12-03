<script setup>
import { DsfrButton } from '@gouvminint/vue-dsfr'
import { onMounted, ref, computed } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter } from 'vue-router'

import config from '@/config'
import { DiscussionsAPI } from '@/services/api/resources/DiscussionsAPI'

import DiscussionList from '../../components/DiscussionList.vue'
import { useDatasetStore } from '../../store/DatasetStore'
import { useTopicStore } from '../../store/TopicStore'
import { useUserStore } from '../../store/UserStore'
import { descriptionFromMarkdown } from '../../utils'

const discussionsAPI = new DiscussionsAPI()
const route = useRoute()
const router = useRouter()
const store = useTopicStore()
const userStore = useUserStore()
const datasetStore = useDatasetStore()
const bouquet = ref({})
const theme = ref()
const subtheme = ref()
const datasets = ref([])
const loading = useLoading()

const discussionsPages = ref([])
const discussions = ref({})
const discussionsPage = ref(1)
const selectedTabIndex = 0

const description = computed(() => descriptionFromMarkdown(bouquet))

const breadcrumbLinks = ref([
  {
    to: '/',
    text: 'Accueil'
  }
])
const selectedTheme = ref('')
const url = window.location.href
const availabilityEnum = {
  MISSING: 'missing',
  NOT_AVAILABLE: 'not available',
  ECO_AVAILABLE: 'available',
  URL_AVAILABLE: 'url available'
}
const missingData = 'Donnée manquante'
const notFoundData = 'Donnée non disponible'

const tabs = [
  { title: 'Discussions', tabId: 'tab-0', panelId: 'tab-content-0' }
]

const goToCreate = () => {
  router.push({ name: 'bouquet_add' })
}

const goBack = () => {
  router.go(-1)
}

const copyUrl = () => {
  navigator.clipboard.writeText(url)
}

const getTheme = (themeName) => {
  const theme = config.themes.find((theme) => theme.name === themeName)
  return theme
}

const convertToHex = (hex, color) => {
  return hex ? `#${parseInt(hex, 16).toString(16).padStart(6, '0')}` : color
}

const getThemeColor = (themeName) => {
  const theme = getTheme(themeName)
  return convertToHex(theme ? theme.color : 'transparent')
}

const getTextColor = (themeName) => {
  const theme = getTheme(themeName)
  return convertToHex(theme ? theme.textColor : '#000000b3')
}

const getSelectedThemeColor = (themed) => {
  selectedTheme.value = themed
  return getThemeColor(selectedTheme.value)
}

const canCreate = computed(() => {
  return (
    userStore.isAdmin() ||
    (userStore.$state.isLoggedIn &&
      bouquet.value.owner?.id === userStore.$state.data?.id)
  )
})

const getTopicDiscussions = async (topicId, page) => {
  if (topicId) {
    discussions.value = await discussionsAPI.getDiscussions({
      subjectId: topicId,
      page
    })
  }
}

const computeDiscussionsPages = (discussions) => {
  if (!discussions.data) return []
  const nbPages = Math.ceil(discussions.total / discussions.page_size)
  return [...Array(nbPages).keys()].map((page) => {
    page += 1
    return {
      label: page,
      href: '#',
      title: `Page ${page}`
    }
  })
}

onMounted(() => {
  const loader = loading.show()
  store
    .load(route.params.bid)
    .then(async (res) => {
      bouquet.value = res
      theme.value =
        bouquet.value.extras[`${config.universe.name}:informations`][0].theme
      subtheme.value =
        bouquet.value.extras[`${config.universe.name}:informations`][0].subtheme

      breadcrumbLinks.value.push(
        {
          text: theme,
          to: `/bouquets/?theme=${theme.value}`
        },
        {
          text: subtheme.value,
          to: `/bouquets/?theme=${theme.value}&subtheme=${subtheme.value}`
        },
        {
          text: bouquet.value.name
        }
      )
      await getTopicDiscussions(bouquet.value.id)
      discussionsPages.value = computeDiscussionsPages(discussions.value)
      // FIXME: not used anymore in template below, change template or remove
      return datasetStore.loadMultiple(res.datasets).then((ds) => {
        datasets.value = ds
      })
    })
    .finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container width-inherit fr-container--fluid fr-mt-4w fr-mb-4w">
    <DsfrBreadcrumb :links="breadcrumbLinks" class="fr-mb-2w" />
    <DsfrButton
      class="backToPage fr-pl-0 fr-mb-2w"
      :tertiary="true"
      :no-outline="true"
      @click.prevent="goBack"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="m5.828 7l2.536 2.535L6.95 10.95L2 6l4.95-4.95l1.414 1.415L5.828 5H13a8 8 0 1 1 0 16H4v-2h9a6 6 0 0 0 0-12H5.828Z"
        />
      </svg>
      Revenir aux résultats
    </DsfrButton>
    <div class="bouquet__header fr-mb-4w">
      <div class="bouquet__header__left">
        <h3 class="fr-mb-3w fr-mb-md-0 fr-mr-md-3w">{{ bouquet.name }}</h3>
        <DsfrTag
          v-if="bouquet.extras"
          class="fr-mb-3w fr-mb-md-0 bold uppercase"
          :label="subtheme"
          :style="{
            backgroundColor: getSelectedThemeColor(theme),
            color: getTextColor(theme)
          }"
        />
      </div>
      <DsfrButton
        v-if="canCreate"
        label="Créer un bouquet"
        icon="ri-pencil-line"
        @click="goToCreate"
      />
    </div>
    <div class="bouquet__container fr-p-6w fr-mb-6w">
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
            v-for="datasetProperties in bouquet.extras[
              `${config.universe.name}:datasets_properties`
            ]"
          >
            <DsfrAccordion
              :id="datasetProperties.id"
              :title="datasetProperties.title"
              :expanded-id="datasetProperties.id"
              @expand="datasetProperties.id = $event"
            >
              <DsfrTag
                v-if="
                  datasetProperties.available !==
                    availabilityEnum.URL_AVAILABLE &&
                  datasetProperties.available !== availabilityEnum.ECO_AVAILABLE
                "
                class="fr-mb-2w uppercase bold"
                :label="`${
                  datasetProperties.available === availabilityEnum.NOT_AVAILABLE
                    ? missingData
                    : datasetProperties.available === availabilityEnum.MISSING
                    ? notFoundData
                    : null
                }`"
              />
              <div class="fr-mb-3w">
                {{ datasetProperties.description }}
              </div>
              <div class="button__wrapper">
                <a
                  v-if="
                    datasetProperties.available !==
                      availabilityEnum.URL_AVAILABLE &&
                    datasetProperties.available !==
                      availabilityEnum.ECO_AVAILABLE
                  "
                  class="fr-btn fr-btn--secondary inline-flex"
                  :href="`mailto:${config.website.contact_email}`"
                >
                  Aidez-nous à trouver la donnée</a
                >
                <a
                  v-else
                  class="fr-btn fr-btn--secondary inline-flex"
                  :href="datasetProperties.uri"
                  target="_blank"
                  >Accéder au catalogue</a
                >
              </div>
            </DsfrAccordion>
          </li>
        </DsfrAccordionsGroup>
      </div>
    </div>

    <DsfrTabs
      class="fr-mt-2w"
      tab-list-name="Groupes d'attributs du bouquet"
      :tab-titles="tabs"
      :initial-selected-index="0"
      :selected-tab-index="selectedTabIndex"
      @select-tab="(idx) => (selectedTabIndex = idx)"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <DiscussionList
          :discussions="discussions.data"
          empty-message="Pas de discussion pour ce bouquet"
        />
        <DsfrPagination
          v-if="discussionsPages.length"
          class="fr-mt-2w"
          :current-page="discussionsPage - 1"
          :pages="discussionsPages"
          @update:current-page="
            (p) => {
              discussionsPage = p + 1
              getTopicDiscussions(bouquet.id, p + 1)
            }
          "
        />
      </DsfrTabContent>
    </DsfrTabs>

    <DsfrButton
      icon="ri-copy"
      :inline="false"
      class="btn-copy fr-ml-auto"
      @click.prevent="copyUrl"
    >
      Copier l'url de la page
    </DsfrButton>
  </div>
</template>

<style scoped lang="scss">
.backToPage {
  color: var(--text-action-high-blue-france);
  text-decoration: none;

  svg {
    margin-right: 5px;
    vertical-align: middle;
  }
}

.bouquet {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-flow: wrap;

    &__left {
      display: flex;
      align-items: center;
      flex-flow: wrap;

      .fr-tag {
        color: rgba(0, 0, 0, 0.7);
        border-radius: 0;
      }
    }
  }

  &__container {
    border: 1px solid var(--border-default-grey);

    :deep(a) {
      color: var(--text-action-high-blue-france);
    }

    .button__wrapper {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      text-align: center;
    }
  }
}
.btn-copy {
  display: block;
}
</style>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter } from 'vue-router'

import config from '@/config'

import { useDatasetStore } from '../../store/DatasetStore'
import { useTopicStore } from '../../store/TopicStore'
import { useUserStore } from '../../store/UserStore'
import { descriptionFromMarkdown } from '../../utils'
import { DsfrButton } from '@gouvminint/vue-dsfr'

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

const description = computed(() => descriptionFromMarkdown(bouquet))

const breadcrumbLinks = ref([
  {
    "to": "/",
    "text": "Accueil"
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

const goToCreate = () => {
  router.push({ name: 'bouquet_add' })
}

const goBack = () => {
  router.go(-1)
}

const copyUrl = () => {
  navigator.clipboard.writeText(url)
}

const getThemeColor = (themeName) => {
  const theme = config.themes.find(theme => theme.name === themeName)
  return theme ? `#${parseInt(theme.color, 16).toString(16).padStart(6, '0')}` : 'transparent'
}

const getSelectedThemeColor = themed => {
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

onMounted(() => {
  const loader = loading.show()
  store
    .load(route.params.bid)
    .then((res) => {
      bouquet.value = res
      theme.value = bouquet.value.extras[`${config.universe.name}:informations`][0].theme
      subtheme.value = bouquet.value.extras[`${config.universe.name}:informations`][0].subtheme

      breadcrumbLinks.value.push(
        {
          text: theme,
          to: `/?theme=${theme.value}`
        },
        {
          text: subtheme.value,
          to: `/?theme=${theme.value}&subtheme=${subtheme.value}`
        },
        {
          text: bouquet.value.name
        }
      )
      // FIXME: not used anymore in template below, change template or remove
      return datasetStore.loadMultiple(res.datasets).then((ds) => {
        datasets.value = ds
      })
    })
    .finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <DsfrButton
      class="backToPage fr-pl-0"
      @click.prevent="goBack"
      :tertiary="true"
      :no-outline="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m5.828 7l2.536 2.535L6.95 10.95L2 6l4.95-4.95l1.414 1.415L5.828 5H13a8 8 0 1 1 0 16H4v-2h9a6 6 0 0 0 0-12H5.828Z"/></svg> 
      Revenir aux résultats
    </DsfrButton>
    <DsfrBreadcrumb :links="breadcrumbLinks" />
    <div class="bouquet__header fr-mb-4w">
      <div class="bouquet__header__left">
        <h3 class="fr-mb-3w fr-mb-md-0 fr-mr-md-3w">{{ bouquet.name }}</h3>
        <DsfrTag
          v-if="bouquet.extras"
          class="fr-mb-3w fr-mb-md-0 bold uppercase"
          :label="subtheme"
          :style="{ backgroundColor: getSelectedThemeColor(theme) }"
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
          <!-- {{ datasetProperties }} -->
            <DsfrAccordion
              :title="datasetProperties.title"
              :id="datasetProperties.id"
              :expanded-id="datasetProperties.id"
              @expand="datasetProperties.id = $event"
            >
            <DsfrTag
                  v-if="
                    datasetProperties.available !==
                      availabilityEnum.URL_AVAILABLE &&
                    datasetProperties.available !==
                      availabilityEnum.ECO_AVAILABLE
                  "
                  class="fr-mb-2w uppercase bold"
                  :label="`${
                    datasetProperties.available ===
                    availabilityEnum.NOT_AVAILABLE
                      ? missingData
                      : datasetProperties.available === availabilityEnum.MISSING
                      ? notFoundData
                      : null
                  }`"
                />
              <div class="fr-mb-3w">
                {{ datasetProperties.description }}
              </div>
              <a
                v-if="datasetProperties.uri"
                class="fr-btn fr-btn--secondary flex fr-ml-auto"
                :href="datasetProperties.uri"
                target="_blank"
                >Accéder au catalogue</a
              >
            </DsfrAccordion>
          </li>
        </DsfrAccordionsGroup>
      </div>
    </div>

    <DsfrButton @click.prevent="copyUrl" icon="ri-copy" :inline="false" class="btn-copy fr-ml-auto">
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

    // @media (max-width: 640px) {
    //   min-height: 100vh;
    //   display: flex;
    //   align-items: center;
    // }

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
  }
}
.btn-copy {
  display: block ;
}
</style>

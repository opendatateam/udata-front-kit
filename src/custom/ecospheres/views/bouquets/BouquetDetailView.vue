<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import DiscussionsList from '@/components/DiscussionsList.vue'
import config from '@/config'
import { isAvailable, type Theme, type Topic } from '@/model'
import { useRouteParamsAsString } from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, fromMarkdown } from '@/utils'

import BouquetDatasetAvailability from '../../components/BouquetDatasetAvailability.vue'

const route = useRouteParamsAsString()
const router = useRouter()

const store = useTopicStore()
const userStore = useUserStore()

const bouquet: Ref<Topic | null> = ref(null)
const theme = ref()
const subtheme = ref()
const loading = useLoading()

const description = computed(() => descriptionFromMarkdown(bouquet))
const showGoBack = computed(() => route.query.fromSearch !== undefined)

const breadcrumbLinks = ref([
  {
    to: '/',
    text: 'Accueil'
  }
])
const selectedTheme = ref('')
const url = window.location.href

const showDiscussions = config.website.discussions.topic.display

const goToEdit = () => {
  router.push({ name: 'bouquet_edit', params: { bid: bouquet.value?.id } })
}

const goBack = () => {
  router.go(-1)
}

const copyUrl = () => {
  navigator.clipboard.writeText(url)
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

const canEdit = computed(() => {
  return (
    userStore.isAdmin() ||
    (userStore.$state.isLoggedIn &&
      bouquet.value?.owner?.id === userStore.$state.data?.id)
  )
})

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
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <DsfrBreadcrumb :links="breadcrumbLinks" class="fr-mb-2w" />
    <DsfrButton
      v-if="showGoBack"
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
        <h3 class="fr-mb-3w fr-mb-md-0 fr-mr-md-3w">{{ bouquet?.name }}</h3>
        <DsfrTag
          v-if="bouquet?.extras"
          class="fr-mb-3w fr-mb-md-0 bold uppercase"
          :label="subtheme"
          :style="{
            backgroundColor: getSelectedThemeColor(theme),
            color: getTextColor(theme)
          }"
        />
      </div>
      <DsfrButton
        v-if="canEdit"
        label="Editer le bouquet"
        icon="ri-pencil-line"
        @click="goToEdit"
      />
    </div>
    <div class="bouquet__container fr-p-6w fr-mb-6w">
      <h5><strong>Objectif du bouquet</strong></h5>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="description" />
      <div
        v-if="
          bouquet?.extras && bouquet.extras['ecospheres:datasets_properties']
        "
      >
        <h5>
          Données utilisées ({{
            bouquet?.extras['ecospheres:datasets_properties'].length
          }})
        </h5>
        <DsfrAccordionsGroup>
          <li
            v-for="(datasetProperties, idx) in bouquet?.extras[
              'ecospheres:datasets_properties'
            ]"
            :key="idx"
          >
            <DsfrAccordion
              :id="datasetProperties.id"
              :title="datasetProperties.title"
              :expanded-id="datasetProperties.id"
              @expand="datasetProperties.id = $event"
            >
              <BouquetDatasetAvailability
                :dataset-properties="datasetProperties"
              />
              <div class="fr-mb-3w">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span v-html="fromMarkdown(datasetProperties.purpose)"></span>
              </div>
              <div class="button__wrapper">
                <a
                  v-if="!isAvailable(datasetProperties.availability)"
                  class="fr-btn fr-btn--secondary inline-flex"
                  :href="`mailto:${config.website.contact_email}`"
                >
                  Aidez-nous à trouver la donnée</a
                >
                <a
                  v-else
                  class="fr-btn fr-btn--secondary inline-flex"
                  :href="datasetProperties.uri ?? undefined"
                  target="_blank"
                  >Accéder au catalogue</a
                >
              </div>
            </DsfrAccordion>
          </li>
        </DsfrAccordionsGroup>
      </div>
    </div>

    <DsfrButton
      icon="ri-clipboard-line"
      :inline="false"
      class="btn-copy fr-ml-auto"
      @click.prevent="copyUrl"
    >
      Copier l'url de la page
    </DsfrButton>

    <div class="fr-mt-8w">
      <DiscussionsList
        v-if="showDiscussions && bouquet"
        :subject="bouquet"
        subject-class="Topic"
      />
    </div>
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

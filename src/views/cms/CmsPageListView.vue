<script lang="ts" setup>
import { storeToRefs } from 'pinia'

import GenericContainer from '@/components/GenericContainer.vue'
import SidebarOwner from '@/components/SidebarOwner.vue'
import config from '@/config'
import type { CmsPage } from '@/model/cms'
import type { CmsPageConfig } from '@/model/config'
import { useCmsPageStore } from '@/store/CmsPageStore'
import { formatDate } from '@/utils'
import { categoryFromTags } from '@/utils/cms'

const cmsPageStore = useCmsPageStore()
const { sitePages: pages, sitePagesPagination } = storeToRefs(cmsPageStore)
const currentPage = ref(1)
const loading = ref(true)

const cmsPages: CmsPageConfig[] = config.website.cms?.pages ?? []
const categories = config.website.cms?.categories ?? []
const categoryForPage = (page: CmsPage) =>
  categoryFromTags(categories, page.tags)
const routeForPage = (page: CmsPage) => {
  const configured = cmsPages.find(
    (p) => p.id === page.id || p.id === page.slug
  )?.route
  if (configured) return configured
  const category = categoryForPage(page)
  return category ? `${category.route_prefix}/${page.slug}` : null
}

const links = [{ to: '/', text: 'Accueil' }, { text: 'CMS' }]

const loadPages = async (page = 1) => {
  loading.value = true
  try {
    await cmsPageStore.listSitePages(page)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPages())

const onUpdatePage = (page: number) => {
  currentPage.value = page + 1
  loadPages(currentPage.value)
}

const handleDelete = async (page: CmsPage) => {
  if (
    !confirm(
      `Supprimer la page « ${page.name} » ? Cette action est irréversible.`
    )
  )
    return
  await cmsPageStore.deletePage(page.id)
  await loadPages(currentPage.value)
}
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-my-2v">
    <div class="fr-grid-row fr-grid-row--middle justify-between fr-mb-3w">
      <h1 class="fr-mb-0">Pages CMS</h1>
      <div class="fr-col-auto">
        <RouterLink
          to="/admin/cms/add"
          class="fr-btn fr-btn--sm fr-icon-add-circle-line fr-btn--icon-left"
        >
          Nouvelle page
        </RouterLink>
      </div>
    </div>
  </div>
  <GenericContainer>
    <div v-if="loading">
      <p>Chargement…</p>
    </div>

    <div v-else-if="pages.length === 0">
      <p>Aucune page créée pour le moment.</p>
    </div>

    <!-- DSFR's outer-frame border only draws once this attribute is set -->
    <div
      v-else
      class="fr-table fr-table--bordered fr-table--no-caption"
      data-fr-js-table="true"
    >
      <div class="fr-table__wrapper">
        <div class="fr-table__container">
          <div class="fr-table__content">
            <table>
              <caption>
                Liste des pages CMS
              </caption>
              <thead>
                <tr>
                  <th scope="col">Titre</th>
                  <th scope="col">Route</th>
                  <th scope="col">Catégorie</th>
                  <th scope="col">Propriétaire</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Dernière modification</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="page in pages" :key="page.id">
                  <td>{{ page.name }}</td>
                  <td>
                    <RouterLink
                      v-if="routeForPage(page)"
                      :to="routeForPage(page)!"
                      class="fr-link fr-text--sm"
                      >{{ routeForPage(page) }}</RouterLink
                    >
                    <span v-else class="fr-text--sm fr-text-mention--grey"
                      >—</span
                    >
                  </td>
                  <td>
                    <span
                      v-if="categoryForPage(page)"
                      class="fr-tag fr-tag--sm"
                      >{{ categoryForPage(page)?.label }}</span
                    >
                    <span v-else class="fr-text--sm fr-text-mention--grey"
                      >—</span
                    >
                  </td>
                  <td>
                    <SidebarOwner :object="page" />
                  </td>
                  <td>
                    <span
                      v-if="page.published"
                      class="fr-badge fr-badge--success"
                      >Publié</span
                    >
                    <span
                      v-else
                      class="fr-badge fr-badge--new fr-badge--no-icon"
                      >Brouillon</span
                    >
                  </td>
                  <td>{{ formatDate(page.last_modified, true) }}</td>
                  <td>
                    <div class="fr-grid-row fr-grid-row--middle flex-gap">
                      <RouterLink
                        :to="`/admin/cms/view/${page.id}`"
                        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-only fr-icon-eye-line"
                        title="Voir"
                      >
                        <span class="fr-sr-only">Voir « {{ page.name }} »</span>
                      </RouterLink>
                      <RouterLink
                        v-if="page.permissions.edit"
                        :to="`/admin/cms/edit/${page.id}`"
                        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-only fr-icon-edit-line"
                        title="Modifier"
                      >
                        <span class="fr-sr-only"
                          >Modifier « {{ page.name }} »</span
                        >
                      </RouterLink>
                      <button
                        v-if="page.permissions.delete"
                        type="button"
                        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-only fr-icon-delete-line"
                        title="Supprimer"
                        @click="handleDelete(page)"
                      >
                        <span class="fr-sr-only"
                          >Supprimer « {{ page.name }} »</span
                        >
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="sitePagesPagination.length > 1" class="fr-container">
      <DsfrPagination
        :trunc-limit="3"
        :current-page="currentPage - 1"
        :pages="sitePagesPagination"
        @update:current-page="onUpdatePage"
      />
    </div>
  </GenericContainer>
</template>

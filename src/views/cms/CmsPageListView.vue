<script lang="ts" setup>
import GenericContainer from '@/components/GenericContainer.vue'
import SidebarOwner from '@/components/SidebarOwner.vue'
import config from '@/config'
import type { CmsPage } from '@/model/cms'
import type { CmsPageConfig } from '@/model/config'
import { useCmsPageStore } from '@/store/CmsPageStore'
import { formatDate } from '@/utils'
import { categoryFromTags } from '@/utils/cms'

const cmsPageStore = useCmsPageStore()
const pages = ref<CmsPage[]>([])
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

onMounted(async () => {
  try {
    pages.value = await cmsPageStore.listSitePages()
  } finally {
    loading.value = false
  }
})

const handleDelete = async (page: CmsPage) => {
  if (
    !confirm(
      `Supprimer la page « ${page.name} » ? Cette action est irréversible.`
    )
  )
    return
  await cmsPageStore.deletePage(page.id)
  pages.value = pages.value.filter((p) => p.id !== page.id)
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

    <!-- DSFR's outer-frame border is only drawn once this attribute is set — normally
    done by its vanilla JS (unused here), but the rule itself is static CSS -->
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
                    <span v-else class="fr-badge fr-badge--new">Brouillon</span>
                  </td>
                  <td>{{ formatDate(page.last_modified, true) }}</td>
                  <td>
                    <div class="fr-grid-row fr-grid-row--middle flex-gap">
                      <RouterLink
                        :to="`/admin/cms/view/${page.id}`"
                        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-only fr-icon-eye-line"
                        title="Voir"
                      />
                      <RouterLink
                        v-if="page.permissions.edit"
                        :to="`/admin/cms/edit/${page.id}`"
                        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-only fr-icon-edit-line"
                        title="Modifier"
                      />
                      <button
                        v-if="page.permissions.delete"
                        type="button"
                        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-only fr-icon-delete-line"
                        title="Supprimer"
                        @click="handleDelete(page)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </GenericContainer>
</template>

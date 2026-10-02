<script lang="ts" setup>
import GenericContainer from '@/components/GenericContainer.vue'
import SidebarOwner from '@/components/SidebarOwner.vue'
import config from '@/config'
import type { CmsPage } from '@/model/cms'
import type { CmsPageConfig } from '@/model/config'
import { useCmsPageStore } from '@/store/CmsPageStore'
import { formatDate } from '@/utils'

const cmsPageStore = useCmsPageStore()
const pages = ref<CmsPage[]>([])
const loading = ref(true)

const cmsPages: CmsPageConfig[] = config.website.cms?.pages ?? []
const routeForPage = (page: CmsPage) =>
  cmsPages.find((p) => p.id === page.id || p.id === page.slug)?.route ?? null

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

    <table v-else class="fr-table">
      <caption class="fr-sr-only">
        Liste des pages CMS
      </caption>
      <thead>
        <tr>
          <th scope="col">Titre</th>
          <th scope="col">Route</th>
          <th scope="col">Propriétaire</th>
          <th scope="col">Visibilité</th>
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
            <span v-else class="fr-text--sm fr-text-mention--grey">—</span>
          </td>
          <td>
            <SidebarOwner :object="page" />
          </td>
          <td>
            <span v-if="!page.private" class="fr-badge fr-badge--success"
              >Public</span
            >
            <span v-else class="fr-badge fr-badge--new">Privé</span>
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
  </GenericContainer>
</template>

<style scoped>
.fr-table {
  width: 100%;
}
</style>

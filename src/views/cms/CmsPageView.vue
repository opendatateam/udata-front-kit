<script lang="ts" setup>
import PageShow from '@/components/cms/PageShow.vue'
import type { CmsPage } from '@/model/cms'
import { useCmsPageStore } from '@/store/CmsPageStore'
import { useCanonicalUrl, useMeta } from '@/utils/seo'

const props = defineProps<{
  id?: string
}>()

const route = useRoute()
const cmsPageStore = useCmsPageStore()

const id = computed(() => props.id ?? (route.params.id as string))

const page = ref<CmsPage | null>(null)
const loading = ref(true)
const error = ref(false)

const isAdminView = computed(() => route.name === 'cms_view')

const breadcrumbLinks = computed(() => {
  const base = [{ to: '/', text: 'Accueil' }]
  if (isAdminView.value) base.push({ to: '/admin/cms', text: 'CMS' })
  return [...base, { text: page.value?.name ?? '…' }]
})

onMounted(async () => {
  try {
    page.value = await cmsPageStore.fetchPageById(id.value)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

useMeta({
  title: () => page.value?.name,
  description: () => undefined,
  canonicalUrl: useCanonicalUrl()
})
</script>

<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--middle justify-between">
      <div class="fr-col">
        <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbLinks" />
      </div>
      <div v-if="page?.permissions.edit" class="fr-col-auto">
        <RouterLink
          :to="`/admin/cms/edit/${page.id}`"
          class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-edit-line fr-btn--icon-left"
        >
          Modifier
        </RouterLink>
      </div>
    </div>
  </div>

  <div v-if="loading" class="fr-container fr-py-6w">
    <p>Chargement…</p>
  </div>

  <div v-else-if="error" class="fr-container fr-py-6w">
    <p>Page introuvable.</p>
  </div>

  <template v-else-if="page">
    <PageShow :blocs="page.blocs" :edit="false" />
  </template>
</template>

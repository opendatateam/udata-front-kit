<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, onMounted, ref } from 'vue'

import { fromMarkdown } from '@/utils'

useHead({
  meta: [
    { property: 'og:title', content: 'Démarche - culture.data.gouv.fr' },
    {
      name: 'description',
      content:
        "Découvrez la démarche et la vision du ministère de la Culture pour l'ouverture des données culturelles."
    },
    {
      property: 'og:description',
      content:
        "Découvrez la démarche et la vision du ministère de la Culture pour l'ouverture des données culturelles."
    }
  ],
  link: [{ rel: 'canonical', href: window.location.origin + '/demarche' }]
})

interface DemarcheContent {
  id: number
  fields: {
    nom: string
    content: string
  }
}

const demarcheContent = ref<DemarcheContent | null>(null)
const loading = ref(true)

// Computed property pour le contenu HTML sécurisé
const safeHtmlContent = computed(() => {
  if (!demarcheContent.value?.fields.content) return ''
  return fromMarkdown(demarcheContent.value.fields.content)
})

const fetchDemarcheContent = async () => {
  try {
    const response = await fetch(
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Pages/records?filter={"nom": ["demarche"]}'
    )
    const data = await response.json()
    if (data.records && data.records.length > 0) {
      demarcheContent.value = data.records[0]
    }
  } catch (error) {
    console.error(
      'Erreur lors de la récupération du contenu de la démarche:',
      error
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDemarcheContent()
})
</script>

<template>
  <div>
    <div v-if="loading" class="fr-container fr-py-8w">
      <p>Chargement...</p>
    </div>

    <div v-else-if="demarcheContent" class="fr-container fr-py-8w">
      <!-- Utilisation d'un div avec innerHTML pour plus de contrôle -->
      <div class="markdown-content" :innerHTML="safeHtmlContent" />
    </div>

    <div v-else class="fr-container fr-py-8w">
      <p>Aucun contenu trouvé.</p>
    </div>
  </div>
</template>

<style scoped>
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-default-grey);
  padding: 0.75rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: var(--background-alt-grey);
  font-weight: 600;
  color: var(--text-title-grey);
}
</style>

<script setup lang="ts">
import '@gouvfr/dsfr-chart/BarChart'
import '@gouvfr/dsfr-chart/BarChart/css'

import { useHead } from '@unhead/vue'
import { computed, onMounted, ref } from 'vue'

import { fromMarkdown } from '@/utils'

useHead({
  meta: [
    { property: 'og:title', content: 'Publier - culture.data.gouv.fr' },
    {
      name: 'description',
      content:
        'Découvrez comment ajouter vos jeux de données au sein de la transversale des données de la culture'
    },
    {
      property: 'og:description',
      content:
        'Découvrez comment ajouter vos jeux de données au sein de la transversale des données de la culture'
    }
  ],
  link: [{ rel: 'canonical', href: window.location.origin + '/publier' }]
})

interface PublierContent {
  id: number
  fields: {
    nom: string
    content: string
  }
}

const publierContent = ref<PublierContent | null>(null)
const loading = ref(true)

// Computed property pour le contenu HTML sécurisé
const safeHtmlContent = computed(() => {
  if (!publierContent.value?.fields.content) return ''
  return fromMarkdown(publierContent.value.fields.content)
})

const fetchPublierContent = async () => {
  try {
    const response = await fetch(
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Pages/records?filter={"nom": ["publier"]}'
    )
    const data = await response.json()
    if (data.records && data.records.length > 0) {
      publierContent.value = data.records[0]
    }
  } catch (error) {
    console.error(
      'Erreur lors de la récupération du contenu de la page Publier:',
      error
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPublierContent()
})
</script>

<template>
  <div class="datagouv-components">
    <div v-if="loading" class="fr-container fr-py-8w">
      <p>Chargement...</p>
    </div>

    <div v-else-if="publierContent" class="fr-container fr-py-8w">
      <!-- Utilisation d'un div avec innerHTML pour plus de contrôle -->
      <div class="markdown-content" :innerHTML="safeHtmlContent" />
    </div>

    <div v-else class="fr-container fr-py-8w">
      <p>Aucun contenu trouvé.</p>
    </div>
  </div>
  <div class="fr-container fr-py-8w">
    <bar-chart
      x="[[2019, 2024, 2025]]"
      y="[[150, 200, 950]]"
      name='["Jeux de données de la Verticale Culture"]'
      selected-palette="default"
      unit-tooltip="jeux de données"
    ></bar-chart>
    <p class="fr-text--sm fr-mt-2w">
      Avant 2025, la plateforme accueillait uniquement les jeux produits par le
      ministère de la Culture.
    </p>
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

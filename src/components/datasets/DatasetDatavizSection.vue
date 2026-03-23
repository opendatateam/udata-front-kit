<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import { computed, onMounted, ref } from 'vue'

interface Props {
  datasetId: string
  gristUrl: string
  title?: string
}

interface GristRecord {
  id: number
  fields: {
    dataset_id?: string
    title?: string
    description?: string
    url?: string
    cta_label?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Datavisualisations associées'
})

const loading = ref(true)
const records = ref<GristRecord[]>([])

const items = computed(() =>
  records.value.filter((record) => record.fields.dataset_id === props.datasetId)
)

const isEmbedUrl = (url?: string) => {
  return !!url && url.includes('/embed')
}

async function fetchDataviz() {
  try {
    const response = await fetch(props.gristUrl)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    records.value = data.records || []
  } catch (error) {
    console.error('Erreur lors du chargement des datavisualisations :', error)
    records.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchDataviz)
</script>

<template>
  <section
    v-if="!loading && items.length"
    class="dataset-dataviz-section fr-mt-6w"
  >
    <h2 class="fr-h3">{{ title }}</h2>

    <div
      v-for="item in items"
      :key="item.id"
      class="dataset-dataviz-item fr-mb-4w"
    >
      <h3 v-if="item.fields.title" class="fr-h5">
        {{ item.fields.title }}
      </h3>

      <div
        v-if="item.fields.description"
        class="dataset-dataviz-description fr-text--sm"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="fromMarkdown(item.fields.description)" />
      </div>

      <!-- Affichage iframe si URL embed -->
      <iframe
        v-if="isEmbedUrl(item.fields.url)"
        :src="item.fields.url"
        width="100%"
        height="500"
        style="border: 0"
        loading="lazy"
        sandbox="allow-forms allow-scripts allow-same-origin"
        allowfullscreen
        :title="item.fields.title || 'Datavisualisation'"
      />

      <!-- Lien fallback -->
      <a
        v-if="item.fields.url"
        :href="item.fields.url"
        target="_blank"
        rel="noopener noreferrer"
        class="fr-link fr-mt-2w"
      >
        {{ item.fields.cta_label || 'Voir la visualisation' }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.dataset-dataviz-section {
  border-top: 1px solid var(--border-default-grey);
  padding-top: 1.5rem;
}

.dataset-dataviz-item {
  padding-top: 1rem;
}

.dataset-dataviz-description :deep(p:last-child) {
  margin-bottom: 0.75rem;
}

iframe {
  margin: 1rem 0;
}
</style>

<script setup lang="ts">
import config from '@/config'
import { fromMarkdown } from '@/utils'
import { createGristClient, type GristRecord } from '@/utils/grist'
import { computed, onMounted, ref } from 'vue'

interface Props {
  datasetId: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Datavisualisations associées'
})

const loading = ref(true)
const items = ref<GristRecord[]>([])

const gristVisualisationsConfig = computed(
  () => config.website.datasets.grist_visualisations
)

const isEmbedUrl = (url?: unknown) => {
  return typeof url === 'string' && url.includes('/embed')
}

const getIframeTitle = (item: GristRecord) => {
  const title =
    typeof item.fields.title === 'string' ? item.fields.title : undefined
  return title
    ? `Visualisation intégrée : ${title}`
    : 'Datavisualisation intégrée'
}

const getLinkLabel = (item: GristRecord) => {
  if (isEmbedUrl(item.fields.url)) {
    return 'Ouvrir la visualisation dans un nouvel onglet'
  }

  return typeof item.fields.cta_label === 'string'
    ? item.fields.cta_label
    : 'Voir la visualisation'
}

const getAccessibleLinkLabel = (item: GristRecord) => {
  const title =
    typeof item.fields.title === 'string'
      ? item.fields.title
      : 'la datavisualisation'

  return `Ouvrir ${title} dans un nouvel onglet`
}

async function fetchDataviz() {
  try {
    const grist = createGristClient(gristVisualisationsConfig.value.doc_id)

    items.value = await grist.getRecords(
      gristVisualisationsConfig.value.table_id,
      { dataset_id: [props.datasetId] }
    )
  } catch (error) {
    console.error('Erreur lors du chargement des datavisualisations :', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchDataviz)
</script>

<template>
  <section
    v-if="!loading && items.length"
    class="dataset-dataviz-section fr-pt-3w"
    aria-labelledby="dataset-dataviz-title"
  >
    <h2 id="dataset-dataviz-title" class="fr-h3">
      {{ title }}
    </h2>

    <div
      v-for="item in items"
      :key="item.id"
      class="dataset-dataviz-item fr-pt-2w fr-mb-4w"
    >
      <h3
        v-if="typeof item.fields.title === 'string' && item.fields.title"
        class="fr-h5"
      >
        {{ item.fields.title }}
      </h3>

      <div
        v-if="
          typeof item.fields.description === 'string' && item.fields.description
        "
        class="dataset-dataviz-description fr-text--sm"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="fromMarkdown(item.fields.description)" />
      </div>

      <iframe
        v-if="isEmbedUrl(item.fields.url)"
        :src="item.fields.url as string"
        class="dataset-dataviz-iframe fr-my-2w"
        loading="lazy"
        sandbox="allow-forms allow-scripts allow-same-origin"
        allowfullscreen
        :title="getIframeTitle(item)"
      />

      <a
        v-if="typeof item.fields.url === 'string' && item.fields.url"
        :href="item.fields.url"
        target="_blank"
        rel="noopener noreferrer"
        class="fr-link fr-icon-external-link-line fr-link--icon-right fr-mt-2w"
        :aria-label="getAccessibleLinkLabel(item)"
      >
        {{ getLinkLabel(item) }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.dataset-dataviz-section {
  border-top: 1px solid var(--border-default-grey);
}

.dataset-dataviz-description :deep(p:last-child) {
  margin-bottom: 0.75rem;
}

.dataset-dataviz-iframe {
  width: 100%;
  min-height: 500px;
  border: 0;
}

/* Ajustement mobile (retour reviewer) */
@media (max-width: 48em) {
  .dataset-dataviz-iframe {
    min-height: 320px;
  }
}
</style>

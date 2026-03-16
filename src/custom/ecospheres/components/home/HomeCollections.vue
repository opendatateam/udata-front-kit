<script setup lang="ts">
import config from '@/config'
import type { EcologieHomepageConf } from '@/custom/ecospheres/model/config'
import TopicsAPI from '@/services/api/resources/TopicsAPI'
import { useUniverseQuery } from '@/utils/universe'

const homepage = config.ecospheres.homepage as EcologieHomepageConf
const collections = homepage.collections

const collectionsTotal = ref<string | number>('...')
const nbDatasetsPerCollection = ref<Record<string, number>>({})

const topicsAPI = new TopicsAPI()

onMounted(() => {
  topicsAPI
    .list({
      params: {
        page_size: 1,
        include_private: 'true',
        ...useUniverseQuery('bouquets', {})
      },
      headers: {
        'x-fields': 'total'
      },
      authenticated: true
    })
    .then((res) => {
      collectionsTotal.value = res.total
    })
  for (const collection of collections) {
    if (!collection.slug) continue
    topicsAPI
      .get({
        entityId: `${collection.slug}/elements`,
        params: {
          page_size: 1,
          class: 'Dataset'
        },
        toasted: false,
        headers: { 'x-fields': 'total' }
      })
      .then(
        (res) => (nbDatasetsPerCollection.value[collection.slug] = res.total)
      )
      .catch((err) =>
        console.error(`Error fetching Topic ${collection.slug}`, err)
      )
  }
})
</script>

<template>
  <section class="fr-container--fluid collections-section fr-py-12v">
    <div class="fr-container">
      <div class="section-header fr-mb-6v">
        <p class="fr-badge fr-badge--new">Nouveau</p>
        <h2 class="fr-mb-2v fr-mt-2v">Collections thématiques</h2>
        <p class="fr-text--lg">
          Sélectionnées par des experts métiers de la communauté
        </p>
      </div>
      <div class="collections-grid">
        <article
          v-for="collection in collections"
          :key="collection.slug || collection.title"
          :class="[
            'card',
            'collection-card',
            { 'fr-enlarge-link': !!collection.slug }
          ]"
        >
          <div class="card-body">
            <p class="fr-badge collection-badge">COLLECTION</p>
            <h3 class="card-title">
              <RouterLink
                v-if="collection.slug"
                :to="{
                  name: 'bouquets_detail',
                  params: { item_id: collection.slug }
                }"
              >
                {{ collection.title }}
              </RouterLink>
              <span v-else>{{ collection.title }}</span>
            </h3>
            <p class="fr-m-0">{{ collection.description }}</p>
            <p class="fr-text--sm creator">
              Créé par {{ collection.creator }}
              <span
                class="fr-icon-checkbox-circle-line fr-icon--sm"
                aria-hidden="true"
              ></span>
            </p>
          </div>
          <div class="card-footer">
            <ul class="fr-tags-group">
              <li>
                <p
                  class="fr-tag fr-icon-database-line fr-tag--icon-left fr-mb-0"
                >
                  {{ nbDatasetsPerCollection[collection.slug] || '...' }} jeux
                  de données
                </p>
              </li>
              <li>
                <p
                  class="fr-tag fr-icon-map-pin-2-line fr-tag--icon-left fr-mb-0"
                >
                  {{ collection.maille }}
                </p>
              </li>
            </ul>
          </div>
        </article>

        <article class="card fr-enlarge-link">
          <RouterLink :to="{ name: 'bouquets' }" class="summary-link">
            <img
              src="@/custom/ecospheres/assets/collections.png"
              alt=""
              aria-hidden="true"
              class="summary-img"
            />
            <div class="summary-footer">
              <div class="summary-text">
                <span class="summary-count">{{ collectionsTotal }}</span>
                <span class="summary-label">Collections thématiques</span>
              </div>
              <span
                class="fr-icon-arrow-right-line fr-icon--lg summary-arrow"
                aria-hidden="true"
              ></span>
            </div>
          </RouterLink>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-header {
  p:last-child {
    font-size: 1.25rem;
    font-weight: 700;
  }
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.collection-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
}

.collection-badge {
  background-color: var(--background-open-blue-france);
  color: var(--text-active-blue-france);
}

.card-title {
  font-size: 1.25rem;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;

  h3 {
    margin: 0;
  }
}

.creator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;

  span {
    color: var(--text-active-blue-france);
    flex-shrink: 0;
    &::before {
      --icon-size: 1.25rem;
    }
  }
}

.card-footer {
  margin-top: auto;

  .fr-tags-group {
    flex-wrap: wrap;
    > li {
      line-height: 1.5rem;
    }
  }
}

.card {
  border: 1px solid var(--border-default-grey);
}

.summary-link {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  text-decoration: none;
  width: 100%;
  height: 100%;
  color: inherit;
}

.summary-img {
  width: 80px;
  height: auto;
}

.summary-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-count {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-active-blue-france);
}

.summary-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-active-blue-france);
}

.summary-arrow {
  color: var(--text-active-blue-france);
  font-size: 1.5rem;
}
</style>

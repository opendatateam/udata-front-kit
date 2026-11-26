<script setup lang="ts">
import config from '@/config'
import HomeTerritorySelect from '@/custom/ecospheres/components/home/HomeTerritorySelect.vue'
import type { SpatialCoverage } from '@/model/spatial'
import {
  networkBaseRouteName,
  networkDefaultPage,
  useNetworksEntries
} from '@/utils/config'
import { trackSearchValidated } from '@/utils/tracking'
import { trackEvent } from '@datagouv/components-next'
import { useRouter } from 'vue-router'
import type { EcologieHomepageThematicTag } from '../../model/config'

const thematicTags: EcologieHomepageThematicTag[] =
  config.ecospheres.homepage?.thematic_tags ?? []

const networksEntries = useNetworksEntries()
const networksCatalogs = computed(() =>
  Object.entries(networksEntries).map(([slug, network]) => {
    const { page } = networkDefaultPage(network)
    const { title, banner } = page
    return {
      title,
      logo: banner.logo,
      to: { name: networkBaseRouteName(slug) }
    }
  })
)

const router = useRouter()
const searchQuery = ref('')
const territory = ref<SpatialCoverage | null>(null)

const doSearch = () => {
  const q = searchQuery.value
  trackSearchValidated(q, 'Accueil')
  if (territory.value) {
    trackEvent('Accueil', 'Recherche avec territoire', territory.value.id)
  }
  router
    .push({
      name: 'datasets',
      query: { q: q || undefined, geozone: territory.value?.id }
    })
    .then(() => {
      searchQuery.value = ''
      territory.value = null
    })
}
</script>

<template>
  <section class="hero-section fr-pt-12v fr-pb-10v">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12 fr-col-lg-10 hero-content">
          <h1>
            Retrouvez les données clés de la
            <span class="highlight">transition écologique</span>
          </h1>
          <form class="big-search" role="search" @submit.prevent="doSearch">
            <div class="fr-input-group big-search__query">
              <label class="fr-label" for="big-select-search">
                Recherchez dans tout le site
              </label>
              <input
                id="big-select-search"
                v-model="searchQuery"
                class="fr-input"
                type="search"
                placeholder="Ex. GES, îlot de chaleur"
              />
            </div>
            <HomeTerritorySelect
              id="big-select-territory"
              v-model="territory"
              class="big-search__territory"
              label="Territoire (optionnel)"
              placeholder="Ex. Finistère"
            />
            <button
              type="submit"
              class="fr-btn fr-btn--lg fr-btn--icon-left fr-icon-search-line"
            >
              Rechercher
            </button>
          </form>
          <ul
            v-if="thematicTags.length"
            class="fr-tags-group fr-mt-5w"
            role="list"
          >
            <li v-for="tag in thematicTags" :key="tag.q">
              <RouterLink
                :to="{ name: 'datasets', query: { q: tag.q } }"
                class="fr-tag"
                @click="trackEvent('Accueil', 'Clic tag thématique', tag.label)"
              >
                {{ tag.label }}
              </RouterLink>
            </li>
          </ul>
          <div v-if="networksCatalogs.length" class="fr-mt-5w">
            <p class="fr-text--bold fr-mb-2v">Catalogues partenaires</p>
            <ul class="networks-catalogs" role="list">
              <li v-for="network in networksCatalogs" :key="network.title">
                <RouterLink
                  :to="network.to"
                  class="fr-raw-link network-catalog-link"
                  @click="
                    trackEvent(
                      'Accueil',
                      'Clic catalogue partenaire',
                      network.title
                    )
                  "
                >
                  <img
                    :src="network.logo"
                    :alt="network.title"
                    loading="lazy"
                  />
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('../../assets/hero-topo-map.webp');
    background-size: cover;
    background-position: center;
    opacity: 0.2;
    z-index: 0;
    pointer-events: none;
  }

  & > .fr-container {
    position: relative;
    z-index: 1;
  }
}

.hero-content {
  width: 100%;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.5em;

  /* fr-lg */
  @media (min-width: 992px) {
    padding: 4rem;
    margin-left: -4rem;
  }
}

h1 {
  max-width: 35rem;
  line-height: 1.2;
  color: var(--text-default-grey);
}

h1 :deep(.highlight),
.highlight {
  color: var(--text-active-blue-france);
}

.fr-tags-group .fr-tag {
  color: var(--text-action-high-blue-france);
  background-color: var(--background-alt-blue-france);
  box-shadow: inset 0 0 0 1px var(--border-open-blue-france);
  font-size: 1.25rem;
  line-height: 2rem;
}

.big-search {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.5rem;

  .fr-input-group {
    margin-bottom: 0;
  }

  .big-search__query {
    flex: 1 1 17.5rem;
    min-width: 0;
  }

  .big-search__territory {
    flex: 1 1 15rem;
    min-width: 0;
  }

  .fr-input {
    min-height: 3rem;
    font-size: 1.125rem;
    box-shadow: inset 0 -2px 0 0 var(--text-default-grey);
  }
}

.networks-catalogs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-inline-start: 0;
}

.network-catalog-link {
  display: flex;
  width: 10rem;
  height: 4.5rem;
  padding: 0.75rem 1rem;
  background-color: #fff;
  border: 1px solid var(--border-default-grey);
  border-radius: 0.25rem;
}

.network-catalog-link:hover,
.network-catalog-link:focus-within {
  background-color: var(--hover);
}

.network-catalog-link img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>

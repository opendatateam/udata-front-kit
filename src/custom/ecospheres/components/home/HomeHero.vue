<script setup lang="ts">
import config from '@/config'
import { useRouter } from 'vue-router'
import type { EcologieHomepageThematicTag } from '../../model/config'

const thematicTags: EcologieHomepageThematicTag[] =
  config.ecospheres.homepage?.thematic_tags ?? []

const router = useRouter()
const searchQuery = ref('')

const doSearch = (q: string) => {
  router.push({ name: 'datasets', query: { q } })
  searchQuery.value = ''
}
</script>

<template>
  <section class="hero-section fr-pt-12v fr-pb-10v">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12 fr-col-lg-9 hero-content">
          <h1>
            Retrouvez les données clés de la
            <span class="highlight">transition écologique</span>
          </h1>
          <div class="big-search">
            <p class="fr-text--bold fr-mb-2v">Recherchez une donnée</p>
            <DsfrSearchBar
              id="big-select-search"
              v-model="searchQuery"
              label="Recherchez une donnée"
              placeholder="Ex. vélo, urbanisme, COP"
              button-text="Rechercher"
              :large="true"
              @search="doSearch"
            />
          </div>
          <ul
            v-if="thematicTags.length"
            class="fr-tags-group fr-mt-5w"
            role="list"
          >
            <li v-for="tag in thematicTags" :key="tag.q">
              <RouterLink
                :to="{ name: 'datasets', query: { q: tag.q } }"
                class="fr-tag"
              >
                {{ tag.label }}
              </RouterLink>
            </li>
          </ul>
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

.big-search :deep(.fr-search-bar) {
  .fr-input {
    box-shadow: inset 0 -2px 0 0 var(--text-default-grey);
  }
}
</style>

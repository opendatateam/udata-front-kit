<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted, ref } from 'vue'

import SearchComponent from '@/components/SearchComponent.vue'
import config from '@/config'

useHead({
  meta: [
    { property: 'og:title', content: config.website.title },
    {
      name: 'description',
      content:
        'culture.data.gouv.fr référence et centralise les données du domaine de la culture.'
    },
    {
      property: 'og:description',
      content:
        'culture.data.gouv.fr référence et centralise les données du domaine de la culture.'
    }
  ],
  link: [{ rel: 'canonical', href: window.location.origin }]
})

const dropdown = config.website.header_search.dropdown

interface Section {
  id: number
  fields: {
    background_color: string
    section: string
    section_title: string
    type: 'cards' | 'tags' | 'highlight' | 'markdown'
    ordre: number
  }
}

interface ContentItem {
  id: number
  fields: {
    section: string
    title: string
    content: string
    ctaLink: string
    imageUrl: string
    ctaLabel: string
  }
}

const sections = ref<Section[]>([])
const contentItems = ref<ContentItem[]>([])
const loading = ref(true)

const fetchSections = async () => {
  try {
    const response = await fetch(
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Table1/records?sort=ordre'
    )
    const data = await response.json()
    sections.value = data.records
  } catch (error) {
    console.error('Erreur lors de la récupération des sections:', error)
  }
}

const fetchContent = async () => {
  try {
    const response = await fetch(
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Content_section/records'
    )
    const data = await response.json()
    contentItems.value = data.records
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error)
  }
}

const getContentForSection = (sectionName: string) => {
  return contentItems.value.filter(
    (item) => item.fields.section === sectionName
  )
}

const getBackgroundClass = (backgroundColor: string) => {
  if (!backgroundColor) return ''
  if (backgroundColor === '#F6F6F6') return 'bg-light'
  if (backgroundColor === '#F3F6FE') return 'bg-blue'
  return ''
}

const parseMarkdown = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br>')
}

onMounted(async () => {
  await Promise.all([fetchSections(), fetchContent()])
  loading.value = false
})
</script>

<template>
  <div class="datagouv-components">
    <section class="fr-container fr-pt-12v">
      <h1 class="main-title-v2">Les données ouvertes de la Culture</h1>
      <p class="fr-text--lead fr-mb-6w text-center">
        culture.data.gouv.fr vise à référencer, héberger et diffuser les données
        publiques relatives à la culture en France. Vous y trouverez des données
        téléchargeables et utilisables de manière libre et gratuite.
      </p>

      <div class="big-search">
        <SearchComponent
          id="big-select-search"
          :placeholder="config.website.header_search.placeholder"
          search-label="Rechercher"
          :dropdown="dropdown"
        />
      </div>
    </section>

    <div v-if="loading" class="fr-container fr-py-8w">
      <p>Chargement...</p>
    </div>

    <template v-else>
      <template v-for="section in sections" :key="section.id">
        <section
          v-if="section.fields.type === 'cards'"
          :class="[
            getBackgroundClass(section.fields.background_color)
              ? 'fr-container--fluid'
              : 'fr-container',
            'fr-py-8w'
          ]"
        >
          <div
            :class="
              getBackgroundClass(section.fields.background_color)
                ? 'fr-container'
                : ''
            "
          >
            <h2>{{ section.fields.section_title }}</h2>

            <div class="cards-container">
              <div
                v-for="item in getContentForSection(section.fields.section)"
                :key="item.id"
                class="card-wrapper"
              >
                <DsfrCard
                  class="subsection-card"
                  alt-img="Image de données culturelles"
                  :description="item.fields.content"
                  :img-src="item.fields.imageUrl || undefined"
                  :link="item.fields.ctaLink"
                  :title="item.fields.title"
                  :title-link-attrs="{}"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          v-else-if="section.fields.type === 'tags'"
          class="fr-container--fluid fr-py-8w"
          :class="getBackgroundClass(section.fields.background_color)"
        >
          <div class="fr-container">
            <h2>{{ section.fields.section_title }}</h2>

            <ul class="fr-tags-group">
              <li
                v-for="item in getContentForSection(section.fields.section)"
                :key="item.id"
              >
                <RouterLink :to="item.fields.ctaLink" class="fr-tag">
                  {{ item.fields.title }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </section>

        <section
          v-else-if="section.fields.type === 'highlight'"
          class="fr-container--fluid fr-py-8w"
          :class="getBackgroundClass(section.fields.background_color)"
        >
          <div class="fr-container">
            <div
              v-for="item in getContentForSection(section.fields.section)"
              :key="item.id"
              class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle highlight-section"
            >
              <div class="fr-col-12 fr-col-md-6" v-if="item.fields.imageUrl">
                <img
                  :src="item.fields.imageUrl"
                  :alt="item.fields.title"
                  class="fr-responsive-img"
                />
              </div>
              <div class="fr-col-12 fr-col-md-6">
                <h3 class="fr-h5 fr-mb-2w">
                  {{ section.fields.section_title }}
                </h3>
                <h4 class="fr-h6 fr-mb-2w">{{ item.fields.title }}</h4>
                <div
                  class="fr-text--sm fr-mb-3w"
                  v-html="parseMarkdown(item.fields.content)"
                ></div>
                <a
                  v-if="item.fields.ctaLink && item.fields.ctaLabel"
                  :href="item.fields.ctaLink"
                  class="fr-btn"
                  target="_blank"
                  rel="noopener"
                >
                  {{ item.fields.ctaLabel }}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          v-else-if="section.fields.type === 'markdown'"
          class="fr-container fr-py-8w actualites"
          :class="getBackgroundClass(section.fields.background_color)"
        >
          <h2>{{ section.fields.section_title }}</h2>
          <div
            v-for="item in getContentForSection(section.fields.section)"
            :key="item.id"
            v-html="parseMarkdown(item.fields.content)"
          ></div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.bg-light {
  background-color: var(--background-alt-grey);
}

.bg-blue {
  background-color: var(--background-alt-blue-cumulus);
}

.actualites {
  background-color: var(--background-default-grey);
}

.main-title-v2 {
  text-align: center;
  font-size: clamp(1.375rem, 0.4698rem + 4.5259vw, 4rem);
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    text-align: inherit;
  }
}

.big-search {
  max-width: 792px;
  margin: 0 auto;
}

section h2 {
  margin-bottom: 2rem;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.card-wrapper {
  flex: 0 1 350px;
}

.subsection-card {
  width: 100%;
  height: 100%;
}

.fr-tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin: 2rem 0;
  list-style: none;
  padding: 0;
}

.fr-tags-group .fr-tag {
  margin: 0;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  background-color: var(--background-action-low-blue-france);
  color: #3a5da6;
}

.fr-tags-group .fr-tag:hover {
  background-color: #a9c8fb;
}

.highlight-section {
  align-items: center;
}

.highlight-section .fr-responsive-img {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: auto;
}

.highlight-section .fr-btn {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }

  .card-wrapper {
    width: 100%;
    max-width: 400px;
  }
}
</style>

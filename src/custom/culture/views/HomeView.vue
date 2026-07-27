<script setup lang="ts">
import { onMounted, ref } from 'vue'

import SearchComponent from '@/components/SearchComponent.vue'
import config from '@/config'
import CultureDatasetCard from '@/custom/culture/components/CultureDatasetCard.vue'
import { fromMarkdown } from '@/utils'
import { useMeta } from '@/utils/seo'

useMeta({
  description: () => config.website.homepage.meta_description,
  canonicalUrl: () => window.location.origin
})

interface Section {
  id: number
  fields: {
    background_color: string
    section: string
    section_title: string
    type: 'cards' | 'tags' | 'highlight' | 'markdown' | 'newsletter'
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

interface TopItem {
  id: number
  fields: {
    type: 'top-datasets' | 'top-reuses' | 'new-datasets'
    type_content: string
    slug: string
    titre: string
    id2: string
    ordre: number
  }
}

const sections = ref<Section[]>([])
const contentItems = ref<ContentItem[]>([])
const topItems = ref<TopItem[]>([])
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

const fetchTopItems = async () => {
  try {
    const response = await fetch(
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Tops/records?sort=ordre'
    )
    const data = await response.json()
    topItems.value = data.records
  } catch (error) {
    console.error('Erreur lors de la récupération des tops:', error)
  }
}

const getContentForSection = (sectionName: string) => {
  return contentItems.value.filter(
    (item) => item.fields.section === sectionName
  )
}

const getTopItemsByType = (
  type: 'top-datasets' | 'top-reuses' | 'new-datasets'
) => {
  return topItems.value.filter((item) => item.fields.type === type)
}

const formatTopItemsAsMarkdown = (items: TopItem[]) => {
  return items
    .map((item) => {
      const url = `${window.location.origin}/datasets/${item.fields.slug}`
      return `[${item.fields.titre}](${url})`
    })
    .join('\n\n')
}

const getBackgroundClass = (backgroundColor: string) => {
  if (!backgroundColor) return ''
  if (backgroundColor === '#F6F6F6') return 'bg-light'
  if (backgroundColor === '#F3F6FE') return 'bg-blue'
  return ''
}

onMounted(() => {
  Promise.all([fetchSections(), fetchContent(), fetchTopItems()]).then(() => {
    loading.value = false
  })
})
</script>

<template>
  <div>
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
          :placeholder="config.website.header.search.placeholder"
          search-label="Rechercher"
        />
      </div>
    </section>

    <div v-if="loading" class="fr-container fr-py-8w">
      <p>Chargement...</p>
    </div>

    <template v-else>
      <section class="fr-container fr-py-8w">
        <h2 class="section-h2">Découvrez les données phares</h2>
        <div class="cards-container">
          <div class="card-wrapper">
            <CultureDatasetCard
              class="subsection-card"
              alt-img="patrimoine"
              :description="
                formatTopItemsAsMarkdown(getTopItemsByType('top-datasets'))
              "
              img-src="/static/culture/assets/MC_Patrimoine_c6e3a5b33cce.webp"
              title="🔥 Jeux les plus consultés"
              :title-link-attrs="{}"
            />
          </div>
          <div class="card-wrapper">
            <CultureDatasetCard
              class="subsection-card"
              alt-img="audiovisuel"
              :description="
                formatTopItemsAsMarkdown(getTopItemsByType('top-reuses'))
              "
              img-src="/static/culture/assets/MC_Publics_b86a092e27b8.webp"
              title="♻️ Jeux les plus réutilisés"
              :title-link-attrs="{}"
            />
          </div>
          <div class="card-wrapper">
            <CultureDatasetCard
              class="subsection-card"
              alt-img="musee"
              :description="
                formatTopItemsAsMarkdown(getTopItemsByType('new-datasets'))
              "
              img-src="/static/culture/assets/MC_Langues_78627c8ca0c3-20251007.webp"
              title="🆕 Nouveaux jeux publiés"
              :title-link-attrs="{}"
            />
          </div>
        </div>
      </section>

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
                <CultureDatasetCard
                  class="subsection-card"
                  alt-img="Image de données culturelles"
                  :description="item.fields.content"
                  :img-src="item.fields.imageUrl || undefined"
                  :link="item.fields.ctaLink"
                  :title="item.fields.title"
                  :cta-label="item.fields.ctaLabel"
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
              <div v-if="item.fields.imageUrl" class="fr-col-12 fr-col-md-6">
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
                <div class="fr-text--sm fr-mb-3w">
                  <div v-html="fromMarkdown(item.fields.content).html"></div>
                </div>
                <a
                  v-if="item.fields.ctaLink && item.fields.ctaLabel"
                  :href="item.fields.ctaLink"
                  class="fr-btn"
                  target="_blank"
                  rel="noopener noreferrer"
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
          >
            <div v-html="fromMarkdown(item.fields.content).html"></div>
          </div>
        </section>

        <section
          v-else-if="section.fields.type === 'newsletter'"
          class="newsletter-social-section"
          :class="getBackgroundClass(section.fields.background_color)"
        >
          <div class="fr-container">
            <div class="newsletter-social-content">
              <div class="newsletter-section">
                <h3>{{ section.fields.section_title }}</h3>
                <div
                  v-for="item in getContentForSection(section.fields.section)"
                  :key="item.id"
                >
                  <div v-html="fromMarkdown(item.fields.content).html"></div>
                </div>
                <a
                  v-if="
                    getContentForSection(section.fields.section)[0]?.fields
                      .ctaLink
                  "
                  :href="
                    getContentForSection(section.fields.section)[0].fields
                      .ctaLink
                  "
                  class="custom-newsletter-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="S'abonner à l'infolettre - nouvelle fenêtre"
                >
                  S'abonner à l'infolettre
                </a>
              </div>
              <div class="divider"></div>

              <div class="social-section">
                <h3>
                  Suivez-nous <br />
                  sur les réseaux sociaux
                </h3>
                <ul class="social-icons-list">
                  <li>
                    <a
                      href="https://www.facebook.com/Culture.Gouv/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook - nouvelle fenêtre"
                      class="social-icon-link"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/culturecommunication/interoperabilite-modeles-referentiels"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub - nouvelle fenêtre"
                      class="social-icon-link"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/company/ministeredelaculture"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn - nouvelle fenêtre"
                      class="social-icon-link"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                      >
                        <path
                          d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/culture_gouv/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram - nouvelle fenêtre"
                      class="social-icon-link"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/channel/UCiAzGffvKfhuGsPsCmVe8sQ"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="YouTube - nouvelle fenêtre"
                      class="social-icon-link"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                      >
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
  background-color: var(--background-alt-blue-france);
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
  margin-bottom: 2rem !important;
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: var(--text-title-grey) !important;
}

.section-h2 {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: var(--text-title-grey) !important;
  margin-bottom: 2rem !important;
  line-height: 1.4 !important;
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

.list-none {
  list-style-type: none !important;
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

/* Section Newsletter / Réseaux sociaux conforme Figma */
.newsletter-social-section {
  background-color: #f3f6fe;
  padding-top: 3rem;
  padding-bottom: 3rem;
  position: relative;
}

.newsletter-social-content {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.newsletter-section {
  flex: 1.2;
}

.newsletter-section h3,
.social-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-title-grey);
}

.newsletter-section p {
  font-size: 0.875rem;
  color: var(--text-default-grey);
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

/* Bouton bleu de la newsletter sans soulignement DSFR */
.custom-newsletter-btn {
  display: inline-block;
  background-color: #000091;
  color: #ffffff !important;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.625rem 1.25rem;
  text-decoration: none !important;
  border-radius: 0;
  transition: background-color 0.2s ease;
  --underline-img: none !important;
  background-image: none !important;
  box-shadow: none !important;
}

.custom-newsletter-btn:hover {
  background-color: #1212ff;
}

/* Séparateur vertical fin */
.divider {
  width: 1px;
  height: 100px;
  background-color: #c0c7d8;
}

.social-section {
  flex: 1;
}

/* Alignement des icônes rondes */
.social-icons-list {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0;
  margin: 1rem 0 0 0;
  list-style: none;
}

/* Annulation stricte du soulignement DSFR sous les icônes */
.social-icon-link {
  color: #000091 !important;
  text-decoration: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
  --underline-img: none !important;
  background-image: none !important;
  box-shadow: none !important;
  border-bottom: none !important;
}

.social-icon-link::after,
.social-icon-link::before {
  content: none !important;
  display: none !important;
}

.social-icon-link:hover {
  color: #1212ff !important;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .newsletter-social-content {
    flex-direction: column;
    gap: 2rem;
  }

  .divider {
    width: 100%;
    height: 1px;
  }
}
</style>

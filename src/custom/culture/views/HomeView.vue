<script setup lang="ts">
import { onMounted, ref } from 'vue'

import SearchComponent from '@/components/SearchComponent.vue'
import config from '@/config'
import CultureDatasetCard from '@/custom/culture/components/CultureDatasetCard.vue'
import { fromMarkdown } from '@/utils'
import { useMeta } from '@/utils/seo'
import { DsfrFollow, DsfrNewsLetter } from '@gouvminint/vue-dsfr'

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

const openLink = (href: string) =>
  window.open(href, '_blank', 'noopener,noreferrer')

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

            <div
              v-if="section.fields.section === 'communaute'"
              class="fr-grid-row fr-grid-row--gutters"
            >
              <div
                v-for="item in getContentForSection(section.fields.section)"
                :key="item.id"
                class="fr-col-12 fr-col-md-4"
              >
                <div
                  :id="`tile-${item.id}`"
                  class="fr-tile fr-tile--horizontal fr-enlarge-link"
                >
                  <div class="fr-tile__body">
                    <div class="fr-tile__content">
                      <h3 class="fr-tile__title">
                        <RouterLink :to="item.fields.ctaLink">
                          {{ item.fields.title }}
                        </RouterLink>
                      </h3>
                      <p class="fr-tile__detail">{{ item.fields.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="cards-container">
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

        <!-- Section Highlight : Image à la même hauteur exacte que le texte -->
        <section
          v-else-if="section.fields.type === 'highlight'"
          class="fr-container--fluid fr-py-8w"
          :class="getBackgroundClass(section.fields.background_color)"
        >
          <div class="fr-container">
            <div
              v-for="item in getContentForSection(section.fields.section)"
              :key="item.id"
              class="highlight-card-wrapper"
            >
              <div class="highlight-text-col">
                <h3 v-if="section.fields.section_title" class="fr-h4 fr-mb-2w">
                  {{ section.fields.section_title }}
                </h3>
                <h4 v-if="item.fields.title" class="fr-h6 fr-mb-2w">
                  {{ item.fields.title }}
                </h4>
                <div class="fr-text--sm fr-mb-3w">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="fromMarkdown(item.fields.content).html"></div>
                </div>
                <div>
                  <a
                    v-if="item.fields.ctaLink && item.fields.ctaLabel"
                    :href="item.fields.ctaLink"
                    class="fr-btn fr-btn--secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                    :title="`${item.fields.ctaLabel} - nouvelle fenêtre`"
                  >
                    {{ item.fields.ctaLabel }}
                  </a>
                </div>
              </div>

              <div v-if="item.fields.imageUrl" class="highlight-img-col">
                <img
                  :src="item.fields.imageUrl"
                  :alt="item.fields.title || 'Illustration'"
                  class="highlight-img"
                />
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
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="fromMarkdown(item.fields.content).html"></div>
          </div>
        </section>

        <DsfrFollow
          v-else-if="section.fields.type === 'newsletter'"
          class="fr-mt-8w"
        >
          <div class="fr-col-12 fr-col-md-8">
            <DsfrNewsLetter
              :title="section.fields.section_title"
              :description="
                getContentForSection(section.fields.section)[0]?.fields.content
              "
              button-text="S'abonner à l'infolettre"
              button-title="S'abonner à l'infolettre - nouvel onglet"
              :button-action="
                () =>
                  openLink(
                    getContentForSection(section.fields.section)[0]?.fields
                      .ctaLink
                  )
              "
              :only-callout="true"
            />
          </div>
          <div class="fr-col-12 fr-col-md-4">
            <div class="fr-follow__social">
              <h2 class="fr-h5">Suivez-nous sur les réseaux sociaux</h2>
              <ul class="fr-btns-group">
                <li>
                  <a
                    title="Facebook - nouvel onglet"
                    href="https://www.facebook.com/Culture.Gouv/"
                    target="_blank"
                    rel="noopener external"
                    class="fr-btn--facebook fr-btn"
                    >Facebook</a
                  >
                </li>
                <li>
                  <a
                    title="LinkedIn - nouvel onglet"
                    href="https://www.linkedin.com/company/ministeredelaculture"
                    target="_blank"
                    rel="noopener external"
                    class="fr-btn--linkedin fr-btn"
                    >LinkedIn</a
                  >
                </li>
                <li>
                  <a
                    title="Instagram - nouvel onglet"
                    href="https://www.instagram.com/culture_gouv/"
                    target="_blank"
                    rel="noopener external"
                    class="fr-btn--instagram fr-btn"
                    >Instagram</a
                  >
                </li>
                <li>
                  <a
                    title="YouTube - nouvel onglet"
                    href="https://www.youtube.com/channel/UCiAzGffvKfhuGsPsCmVe8sQ"
                    target="_blank"
                    rel="noopener external"
                    class="fr-btn--youtube fr-btn"
                    >YouTube</a
                  >
                </li>
                <li>
                  <a
                    title="GitHub - nouvel onglet"
                    href="https://github.com/culturecommunication/interoperabilite-modeles-referentiels"
                    target="_blank"
                    rel="noopener external"
                    class="fr-btn--github fr-btn"
                    >GitHub</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </DsfrFollow>
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

/* --- Bloc Highlight DSFR (Image restreinte à la hauteur exacte du texte) --- */
.highlight-card-wrapper {
  display: flex;
  align-items: stretch;
  gap: 2.5rem;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
}

.highlight-text-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.highlight-img-col {
  flex: 0 0 320px;
  width: 320px;
  max-width: 320px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: auto;
    width: 100%;
    max-width: 100%;
    height: 250px;
  }
}

.highlight-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;

  @media (max-width: 768px) {
    position: static;
  }
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

.github-link {
  list-style: none;
}
</style>

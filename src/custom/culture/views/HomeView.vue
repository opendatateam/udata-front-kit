<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import SearchComponent from '@/components/SearchComponent.vue'
import config from '@/config'
import CultureDatasetCard from '@/custom/culture/components/CultureDatasetCard.vue'
import HeroSection from '@/custom/culture/components/HeroSection.vue'
import { fromMarkdown } from '@/utils'
import { useMeta } from '@/utils/seo'
import { DsfrCard, DsfrFollow, DsfrNewsLetter } from '@gouvminint/vue-dsfr'

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

const typeLabel: Record<string, string> = {
  'top-datasets': 'Jeux les plus consultés',
  'top-reuses': 'Jeux les plus réutilisés',
  'new-datasets': 'Nouveau jeu'
}

const formatTopItemsAsCards = (items: TopItem[]) => {
  return items.map((item) => ({
    title: item.fields.titre,
    link: `/datasets/${item.fields.slug}`,
    type: item.fields.type
  }))
}

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

const hero = computed(() => {
  const item = contentItems.value.find(
    (i) => i.fields.section === 'hero'
  )?.fields
  return {
    title: item?.title || 'Les données ouvertes de la Culture',
    description:
      item?.content ||
      'culture.data.gouv.fr vise à référencer, héberger et diffuser les données publiques relatives à la culture en France. Vous y trouverez des données téléchargeables et utilisables de manière libre et gratuite.',
    imageUrl: item?.imageUrl || ''
  }
})

const getTopItemsByType = (
  type: 'top-datasets' | 'top-reuses' | 'new-datasets'
) => {
  return topItems.value.filter((item) => item.fields.type === type)
}

const getBackgroundClass = (backgroundColor: string) => {
  if (!backgroundColor) return ''
  if (backgroundColor === '#F6F6F6') return 'bg-light'
  if (backgroundColor === '#F3F6FE') return 'bg-blue'
  return ''
}

onMounted(() => {
  Promise.all([fetchSections(), fetchContent(), fetchTopItems()]).finally(
    () => {
      loading.value = false
    }
  )
})
</script>

<template>
  <div>
    <HeroSection
      :title="hero.title"
      :description="hero.description"
      :image-url="hero.imageUrl"
      alt-img=""
      :colors="config.website.home_banner_colors"
    >
      <template #search>
        <div class="big-search">
          <SearchComponent
            id="big-select-search"
            :placeholder="config.website.header.search.placeholder"
            search-label="Rechercher"
          />
        </div>
      </template>
    </HeroSection>

    <div v-if="loading" class="fr-container fr-py-8w">
      <p>Chargement...</p>
    </div>

    <template v-else>
      <section class="fr-container fr-py-8w">
        <h2 class="section-h2">Découvrez les données phares</h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div
            v-for="card in [
              ...formatTopItemsAsCards(getTopItemsByType('top-datasets')),
              ...formatTopItemsAsCards(getTopItemsByType('top-reuses')),
              ...formatTopItemsAsCards(getTopItemsByType('new-datasets'))
            ]"
            :key="card.link"
            class="fr-col-12 fr-col-md-4"
          >
            <DsfrCard
              :title="card.title"
              :link="card.link"
              :enlarge="true"
              title-tag="h3"
            >
              <template #start-details>
                <ul class="fr-badges-group">
                  <li>
                    <span
                      class="fr-badge fr-badge--sm fr-badge--purple-glycine fr-badge--no-icon"
                    >
                      {{ typeLabel[card.type] }}
                    </span>
                  </li>
                </ul>
              </template>
            </DsfrCard>
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
          style="background-color: #e9f9dd"
        >
          <div class="fr-container">
            <h2 class="fr-h2">{{ section.fields.section_title }}</h2>

            <ul
              class="fr-tags-group"
              aria-label="Liste des thématiques culturelles"
            >
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

.big-search {
  display: flex;
  width: 100%;
  max-width: 588px;
  align-items: flex-start;
}

.big-search > * {
  flex: 1;
  width: 100%;
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

.list-none {
  list-style-type: none !important;
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
</style>

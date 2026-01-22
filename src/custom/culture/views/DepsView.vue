<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted, ref } from 'vue'

import SearchComponent from '@/components/SearchComponent.vue'
import config from '@/config'
import CultureDatasetCard from '@/custom/culture/components/CultureDatasetCard.vue'
import { fromMarkdown } from '@/utils'

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
  link: [{ rel: 'canonical', href: window.location.origin + '/deps' }]
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
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Deps_sections/records?sort=ordre'
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
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Deps_content_section/records'
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
      'https://grist.numerique.gouv.fr/api/docs/hrDZg8StuE1d/tables/Deps_tops/records?sort=ordre'
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
      const url = `/datasets/${item.fields.slug}`
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
  <div class="datagouv-components">
    <section class="fr-container fr-pt-12v">
      <h1 class="main-title-v2">Les données du DEPS</h1>
      <p class="fr-text--lead fr-mb-6w text-center">
        culture.data.gouv.fr vise à référencer, héberger et diffuser les données
        publiques relatives à la culture en France. Vous y trouverez des données
        téléchargeables et utilisables de manière libre et gratuite.
      </p>

      <div class="big-search">
        <SearchComponent
          id="big-select-search"
          :placeholder="xxx"
          search-label="Rechercher"
          :search-endpoint-params="{ tag: 'deps-doc' }"
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
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="fromMarkdown(item.fields.content)"></div>
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
            <div v-html="fromMarkdown(item.fields.content)"></div>
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
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="fromMarkdown(item.fields.content)"></div>
                </div>
                <br />
                <a
                  v-if="
                    getContentForSection(section.fields.section)[0]?.fields
                      .ctaLink &&
                    getContentForSection(section.fields.section)[0]?.fields
                      .ctaLabel
                  "
                  :href="
                    getContentForSection(section.fields.section)[0].fields
                      .ctaLink
                  "
                  class="fr-btn fr-btn--primary"
                  target="_blank"
                  rel="noopener"
                >
                  {{
                    getContentForSection(section.fields.section)[0].fields
                      .ctaLabel
                  }}
                </a>
              </div>
              <div class="divider"></div>
              <div class="social-section">
                <h3>Suivez-nous sur les réseaux sociaux</h3>
                <ul class="flex justify-between list-none m-0 p-0 *:p-0 -ml-4">
                  <li>
                    <a
                      class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                      title="Linkedin - nouvel onglet"
                      href="https://www.linkedin.com/company/ministeredelaculture"
                      target="_blank"
                      ><svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        class="remixicon"
                      >
                        <path
                          d="M4.00098 3H20.001C20.5533 3 21.001 3.44772 21.001 4V20C21.001 20.5523 20.5533 21 20.001 21H4.00098C3.44869 21 3.00098 20.5523 3.00098 20V4C3.00098 3.44772 3.44869 3 4.00098 3ZM5.00098 5V19H19.001V5H5.00098ZM7.50098 9C6.67255 9 6.00098 8.32843 6.00098 7.5C6.00098 6.67157 6.67255 6 7.50098 6C8.3294 6 9.00098 6.67157 9.00098 7.5C9.00098 8.32843 8.3294 9 7.50098 9ZM6.50098 10H8.50098V17.5H6.50098V10ZM12.001 10.4295C12.5854 9.86534 13.2665 9.5 14.001 9.5C16.072 9.5 17.501 11.1789 17.501 13.25V17.5H15.501V13.25C15.501 12.2835 14.7175 11.5 13.751 11.5C12.7845 11.5 12.001 12.2835 12.001 13.25V17.5H10.001V10H12.001V10.4295Z"
                        ></path></svg
                    ></a>
                  </li>
                  <li>
                    <a
                      class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                      title="Instagram - nouvel onglet"
                      href="https://www.instagram.com/culture_gouv/"
                      target="_blank"
                      ><svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        class="remixicon"
                      >
                        <path
                          d="M9.828 5L7.828 7H4V19H20V7H16.172L14.172 5H9.828ZM9 3H15L17 5H21C21.2652 5 21.5196 5.10536 21.7071 5.29289C21.8946 5.48043 22 5.73478 22 6V20C22 20.2652 21.8946 20.5196 21.7071 20.7071C21.5196 20.8946 21.2652 21 21 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V6C2 5.73478 2.10536 5.48043 2.29289 5.29289C2.48043 5.10536 2.73478 5 3 5H7L9 3ZM12 18C10.5413 18 9.14236 17.4205 8.11091 16.3891C7.07946 15.3576 6.5 13.9587 6.5 12.5C6.5 11.0413 7.07946 9.64236 8.11091 8.61091C9.14236 7.57946 10.5413 7 12 7C13.4587 7 14.8576 7.57946 15.8891 8.61091C16.9205 9.64236 17.5 11.0413 17.5 12.5C17.5 13.9587 16.9205 15.3576 15.8891 16.3891C14.8576 17.4205 13.4587 18 12 18ZM12 16C12.9283 16 13.8185 15.6313 14.4749 14.9749C15.1313 14.3185 15.5 13.4283 15.5 12.5C15.5 11.5717 15.1313 10.6815 14.4749 10.0251C13.8185 9.36875 12.9283 9 12 9C11.0717 9 10.1815 9.36875 9.52513 10.0251C8.86875 10.6815 8.5 11.5717 8.5 12.5C8.5 13.4283 8.86875 14.3185 9.52513 14.9749C10.1815 15.6313 11.0717 16 12 16V16Z"
                          fill="#000091"
                        /></svg
                    ></a>
                  </li>
                  <li>
                    <a
                      class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                      title="Facebook - nouvel onglet"
                      href="https://www.facebook.com/Culture.Gouv/"
                      target="_blank"
                      ><svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        class="remixicon"
                      >
                        <path
                          d="M14 19H19V5H5V19H12V14H10V12H12V10.346C12 9.009 12.14 8.524 12.4 8.035C12.6561 7.55119 13.052 7.15569 13.536 6.9C13.918 6.695 14.393 6.572 15.223 6.519C15.552 6.498 15.978 6.524 16.501 6.599V8.499H16C15.083 8.499 14.704 8.542 14.478 8.663C14.3431 8.73236 14.2334 8.84215 14.164 8.977C14.044 9.203 14 9.427 14 10.345V12H16.5L16 14H14V19ZM4 3H20C20.2652 3 20.5196 3.10536 20.7071 3.29289C20.8946 3.48043 21 3.73478 21 4V20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8946 20.2652 21 20 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V4C3 3.73478 3.10536 3.48043 3.29289 3.29289C3.48043 3.10536 3.73478 3 4 3V3Z"
                          fill="#000091"
                        /></svg
                    ></a>
                  </li>
                  <li>
                    <a
                      class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                      title="Github - nouvel onglet"
                      href="https://github.com/culturecommunication/interoperabilite-modeles-referentiels"
                      target="_blank"
                      ><svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        class="remixicon"
                      >
                        <path
                          d="M5.88401 18.6533C5.58404 18.4526 5.32587 18.1975 5.0239 17.8369C4.91473 17.7065 4.47283 17.1524 4.55811 17.2583C4.09533 16.6833 3.80296 16.417 3.50156 16.3089C2.9817 16.1225 2.7114 15.5499 2.89784 15.0301C3.08428 14.5102 3.65685 14.2399 4.17672 14.4263C4.92936 14.6963 5.43847 15.1611 6.12425 16.0143C6.03025 15.8974 6.46364 16.441 6.55731 16.5529C6.74784 16.7804 6.88732 16.9182 6.99629 16.9911C7.20118 17.1283 7.58451 17.1874 8.14709 17.1311C8.17065 16.7489 8.24136 16.3783 8.34919 16.0358C5.38097 15.3104 3.70116 13.3952 3.70116 9.63971C3.70116 8.40085 4.0704 7.28393 4.75917 6.3478C4.5415 5.45392 4.57433 4.37284 5.06092 3.15636C5.1725 2.87739 5.40361 2.66338 5.69031 2.57352C5.77242 2.54973 5.81791 2.53915 5.89878 2.52673C6.70167 2.40343 7.83573 2.69705 9.31449 3.62336C10.181 3.41879 11.0885 3.315 12.0012 3.315C12.9129 3.315 13.8196 3.4186 14.6854 3.62277C16.1619 2.69 17.2986 2.39649 18.1072 2.52651C18.1919 2.54013 18.2645 2.55783 18.3249 2.57766C18.6059 2.66991 18.8316 2.88179 18.9414 3.15636C19.4279 4.37256 19.4608 5.45344 19.2433 6.3472C19.9342 7.28337 20.3012 8.39208 20.3012 9.63971C20.3012 13.3968 18.627 15.3048 15.6588 16.032C15.7837 16.447 15.8496 16.9105 15.8496 17.4121C15.8496 18.0765 15.8471 18.711 15.8424 19.4225C15.8412 19.6127 15.8397 19.8159 15.8375 20.1281C16.2129 20.2109 16.5229 20.5077 16.6031 20.9089C16.7114 21.4504 16.3602 21.9773 15.8186 22.0856C14.6794 22.3134 13.8353 21.5538 13.8353 20.5611C13.8353 20.4708 13.836 20.3417 13.8375 20.1145C13.8398 19.8015 13.8412 19.599 13.8425 19.4094C13.8471 18.7019 13.8496 18.0716 13.8496 17.4121C13.8496 16.7148 13.6664 16.2602 13.4237 16.051C12.7627 15.4812 13.0977 14.3973 13.965 14.2999C16.9314 13.9666 18.3012 12.8177 18.3012 9.63971C18.3012 8.68508 17.9893 7.89571 17.3881 7.23559C17.1301 6.95233 17.0567 6.54659 17.199 6.19087C17.3647 5.77663 17.4354 5.23384 17.2941 4.57702L17.2847 4.57968C16.7928 4.71886 16.1744 5.0198 15.4261 5.5285C15.182 5.69438 14.8772 5.74401 14.5932 5.66413C13.7729 5.43343 12.8913 5.315 12.0012 5.315C11.111 5.315 10.2294 5.43343 9.40916 5.66413C9.12662 5.74359 8.82344 5.69492 8.57997 5.53101C7.8274 5.02439 7.2056 4.72379 6.71079 4.58376C6.56735 5.23696 6.63814 5.77782 6.80336 6.19087C6.94565 6.54659 6.87219 6.95233 6.61423 7.23559C6.01715 7.8912 5.70116 8.69376 5.70116 9.63971C5.70116 12.8116 7.07225 13.9683 10.023 14.2999C10.8883 14.3971 11.2246 15.4769 10.5675 16.0482C10.3751 16.2156 10.1384 16.7802 10.1384 17.4121V20.5611C10.1384 21.5474 9.30356 22.2869 8.17878 22.09C7.63476 21.9948 7.27093 21.4766 7.36613 20.9326C7.43827 20.5204 7.75331 20.2116 8.13841 20.1276V19.1381C7.22829 19.1994 6.47656 19.0498 5.88401 18.6533Z"
                        ></path></svg
                    ></a>
                  </li>
                  <li>
                    <a
                      class="link !inline-flex after:!content-none mx-2 !p-2 min-h-10 mh-10 mw-10 !no-underline hover:!bg-gray-some"
                      title="Youtube - nouvel onglet"
                      href="https://www.youtube.com/channel/UCiAzGffvKfhuGsPsCmVe8sQ"
                      target="_blank"
                      ><svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        class="remixicon"
                      >
                        <path
                          d="M19.606 6.995C19.53 6.697 19.314 6.472 19.067 6.403C18.63 6.28 16.5 6 12 6C7.5 6 5.372 6.28 4.931 6.403C4.687 6.471 4.471 6.696 4.394 6.995C4.285 7.419 4 9.196 4 12C4 14.804 4.285 16.58 4.394 17.006C4.47 17.303 4.686 17.528 4.932 17.596C5.372 17.72 7.5 18 12 18C16.5 18 18.629 17.72 19.069 17.597C19.313 17.529 19.529 17.304 19.606 17.005C19.715 16.581 20 14.8 20 12C20 9.2 19.715 7.42 19.606 6.995ZM21.543 6.498C22 8.28 22 12 22 12C22 12 22 15.72 21.543 17.502C21.289 18.487 20.546 19.262 19.605 19.524C17.896 20 12 20 12 20C12 20 6.107 20 4.395 19.524C3.45 19.258 2.708 18.484 2.457 17.502C2 15.72 2 12 2 12C2 12 2 8.28 2.457 6.498C2.711 5.513 3.454 4.738 4.395 4.476C6.107 4 12 4 12 4C12 4 17.896 4 19.605 4.476C20.55 4.742 21.292 5.516 21.543 6.498ZM10 15.5V8.5L16 12L10 15.5Z"
                          fill="#000091"
                        /></svg
                    ></a>
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

.newsletter-social-section {
  background-color: var(--background-alt-blue-cumulus);
  padding: 3rem 0;
  margin-top: 0;
  margin-bottom: 0;
}

.newsletter-social-content {
  display: flex;
  align-items: stretch;
  gap: 2rem;
}

.newsletter-section {
  flex: 2;
  padding: 2rem;
}

.newsletter-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-title-grey);
}

.newsletter-section p {
  color: var(--text-default-grey);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.divider {
  width: 1px;
  background-color: var(--border-default-grey);
  margin: 0 1rem;
}

.social-section {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.social-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-title-grey);
}

/* Styles basiques pour les liens sociaux */
.social-section a {
  text-decoration: none;
  --underline-img: none;
}

.social-section a::after {
  display: none;
}

@media (max-width: 768px) {
  .newsletter-social-content {
    flex-direction: column;
  }

  .divider {
    width: 100%;
    height: 1px;
    margin: 1rem 0;
  }
}
</style>

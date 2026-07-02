<template>
  <div class="article-page">
    <div
      v-if="breadcrumbLinks.length"
      class="fr-container article-hero__breadcrumb fr-pt-3v fr-pt-md-0"
    >
      <DsfrBreadcrumb :links="breadcrumbLinks" class="fr-mb-4v" />
    </div>
    <header class="article-hero fr-pb-3v fr-pb-md-4v">
      <div
        v-if="heroImageSrc"
        class="article-hero__media"
        :style="heroImageStyle"
        aria-hidden="true"
      ></div>
      <div
        v-else
        class="article-hero__backdrop"
        :style="heroBackdropStyle"
        aria-hidden="true"
      ></div>

      <div class="fr-container article-hero__inner fr-mb-4v fr-mb-md-8v">
        <div
          class="article-hero__panel fr-pt-4v fr-px-4v fr-pb-5v fr-pt-md-6v fr-px-md-7v fr-pb-md-7v"
          :style="heroPanelStyle"
        >
          <div v-if="hasMeta" class="article-hero__meta fr-mb-3v fr-mb-md-4v">
            <ul
              v-if="slots.badges"
              class="article-hero__badge-list fr-p-0 fr-m-0"
            >
              <li><slot name="badges" /></li>
            </ul>
            <ul
              v-if="articleTags.length"
              class="article-hero__tag-list fr-p-0 fr-m-0"
            >
              <li v-for="tag in articleTags" :key="tag.label">
                <a
                  v-if="tag.href"
                  class="fr-tag fr-tag--sm fr-m-0"
                  :href="tag.href"
                >
                  {{ tag.label }}
                </a>
                <p v-else class="fr-tag fr-tag--sm fr-m-0">
                  {{ tag.label }}
                </p>
              </li>
            </ul>
          </div>
          <p
            v-if="kicker"
            class="article-hero__kicker fr-text--sm fr-mb-3v fr-py-1v fr-px-3v"
          >
            {{ kicker }}
          </p>
          <h1 class="article-hero__title fr-m-0">{{ h1 }}</h1>
          <p v-if="lead" class="article-hero__lead fr-mt-4v">
            {{ lead }}
          </p>
        </div>
      </div>
    </header>

    <div class="fr-container article-shell fr-py-8v">
      <div class="fr-grid-row fr-grid-row--gutters article-grid">
        <aside
          class="fr-col-12 fr-col-lg-3 article-toc-col fr-mb-4v fr-mb-md-0"
        >
          <nav
            class="fr-sidemenu article-toc"
            role="navigation"
            aria-labelledby="article-sidemenu-title"
          >
            <div class="fr-sidemenu__inner">
              <button
                class="fr-sidemenu__btn"
                type="button"
                :aria-expanded="sidemenuExpanded"
                aria-controls="article-sidemenu-collapse"
                @click="sidemenuExpanded = !sidemenuExpanded"
              >
                Dans cet article
              </button>
              <div
                id="article-sidemenu-collapse"
                :class="[
                  'fr-collapse',
                  { 'fr-collapse--expanded': sidemenuExpanded }
                ]"
              >
                <p id="article-sidemenu-title" class="fr-sidemenu__title">
                  Sommaire
                </p>
                <ul class="fr-sidemenu__list">
                  <li
                    v-for="section in sections"
                    :key="section.id"
                    class="fr-sidemenu__item"
                  >
                    <a
                      class="fr-sidemenu__link"
                      :aria-current="
                        activeSection === section.id ? 'true' : undefined
                      "
                      :href="`#${section.id}`"
                      @click="activeSection = section.id"
                    >
                      {{ section.label }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </aside>

        <main
          ref="articleRef"
          class="fr-col-12 fr-col-lg-9 article-content-col"
        >
          <div class="article-content">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@/model/breadcrumb'
import { useCanonicalUrl, useMeta } from '@/utils/seo'
import { provide, useSlots } from 'vue'
import { articleSectionKey } from './articleSectionKey'

type ArticleSection = {
  id: string
  label: string
}

type ArticleAudienceTag = {
  label: string
  href?: string
}

const props = withDefaults(
  defineProps<{
    h1: string
    title?: string
    lead?: string
    kicker?: string
    heroImageSrc?: string
    articleTags?: readonly ArticleAudienceTag[]
    breadcrumbLinks?: readonly BreadcrumbItem[]
    // CSS gradient or image url() for the hero backdrop when no image is provided.
    // Example: 'linear-gradient(135deg, #1b1b35 0%, #1e1e1e 100%)'
    heroBackdropGradient?: string
    // Background color of the light panel containing the kicker, title and lead.
    // Recommended DSFR values: var(--background-alt-beige-gris-galet)
    heroPanelBackground?: string
  }>(),
  {
    title: undefined,
    lead: undefined,
    kicker: '',
    heroImageSrc: '',
    articleTags: () => [],
    heroBackdropGradient: 'linear-gradient(135deg, #1b1b35 0%, #1e1e1e 100%)',
    heroPanelBackground: 'var(--background-alt-beige-gris-galet)',
    breadcrumbLinks: () => []
  }
)

const slots = useSlots()
const metaTitle = computed(() => props.title ?? props.h1)

useMeta({
  title: metaTitle,
  description: () => props.lead,
  canonicalUrl: useCanonicalUrl()
})

const sections = ref<ArticleSection[]>([])
provide(articleSectionKey, (id, label) => sections.value.push({ id, label }))

const sidemenuExpanded = ref(true)

const articleRef = ref<HTMLElement | null>(null)
const activeSection = ref('')
let observer: IntersectionObserver | undefined

const heroBackdropStyle = computed(() => ({
  backgroundImage: props.heroBackdropGradient
}))

const heroImageStyle = computed(() => ({
  backgroundImage: props.heroImageSrc
    ? `linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.18)), url('${props.heroImageSrc}')`
    : 'none'
}))

const heroPanelStyle = computed(() => ({
  backgroundColor: props.heroPanelBackground
}))

const hasMeta = computed(() => props.articleTags.length > 0 || !!slots.badges)

onMounted(() => {
  activeSection.value = sections.value[0]?.id ?? ''

  const container = articleRef.value
  if (!container) return

  const targets = sections.value
    .map((section) => container.querySelector<HTMLElement>(`#${section.id}`))
    .filter((el): el is HTMLElement => el !== null)

  if (!targets.length || typeof IntersectionObserver === 'undefined') return

  const visibleSections = new Set<string>()

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!(entry.target instanceof HTMLElement) || !entry.target.id) continue
        if (entry.isIntersecting) {
          visibleSections.add(entry.target.id)
        } else {
          visibleSections.delete(entry.target.id)
        }
      }

      // First intersecting section in document order
      const firstVisible = sections.value.find((s) => visibleSections.has(s.id))
      if (firstVisible) {
        activeSection.value = firstVisible.id
        return
      }

      // Fast-scroll fallback: no section in the observation zone.
      // Activate the last section whose heading has scrolled above the zone top (10% from top).
      const zoneTop = window.innerHeight * 0.1
      let last = ''
      for (const section of sections.value) {
        const el = container.querySelector<HTMLElement>(`#${section.id}`)
        if (el && el.getBoundingClientRect().top < zoneTop) last = section.id
      }
      if (last) activeSection.value = last
    },
    {
      root: null,
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    }
  )

  targets.forEach((target) => observer?.observe(target))
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.article-page {
  --article-content-max: 68ch;
}

.article-hero {
  color: var(--text-inverted-grey);
  position: relative;
  min-height: clamp(16rem, 24vw, 21rem);
  overflow: hidden;
}

.article-hero__backdrop,
.article-hero__media {
  position: absolute;
  inset: 0 0 60px 0;
  background: center / cover no-repeat;
}

.article-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  min-height: 0;
  margin-top: clamp(5.5rem, 9vw, 8rem);
}

.article-hero__breadcrumb {
  position: relative;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.75);
}

.article-hero__panel {
  position: relative;
  z-index: 1;
  width: min(75%, 64rem);
  color: var(--text-title-grey);
}

.article-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.article-hero__tag-list,
.article-hero__badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
}

.article-hero__tag-list > li,
.article-hero__badge-list > li {
  display: flex;
}

.article-hero__kicker {
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--text-title-blue-france);
  background-color: var(--background-default-grey);
  border-radius: 999px;
}

.article-hero__title {
  font-size: clamp(2rem, 3.8vw, 3.4rem);
  line-height: 1.05;
}

.article-hero__lead {
  font-size: clamp(1.08rem, 1.2vw, 1.28rem);
  line-height: 1.65;
  color: var(--text-default-grey);
}

.article-grid {
  align-items: stretch;
}

.article-toc-col {
  position: sticky;
  top: 1rem;
  align-self: start;
  height: calc(100vh - 2rem);
}

.article-toc {
  width: 100%;
}

.article-content-col {
  display: flex;
  justify-content: center;
}

.article-content {
  width: 100%;
  max-width: var(--article-content-max);
}

@media (max-width: 48em) {
  .article-hero {
    min-height: 16rem;
  }

  .article-hero__inner {
    margin-top: 4.5rem;
  }

  .article-hero__panel {
    width: 100%;
  }

  .article-hero__title {
    max-width: none;
    font-size: clamp(1.8rem, 7vw, 2.5rem);
  }

  .article-toc-col {
    position: static;
    height: auto;
  }

  .article-content {
    max-width: none;
  }
}
</style>

<template>
  <div class="article-page">
    <div v-if="breadcrumbLinks.length" class="fr-container article-hero__breadcrumb">
        <DsfrBreadcrumb :links="breadcrumbLinks" />
      </div>
    <header class="article-hero">
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

      

      <div class="fr-container article-hero__inner">
        <div class="article-hero__panel" :style="heroPanelStyle">
          <div v-if="hasMeta" class="article-hero__meta">
            <ul v-if="articleBadges.length" class="article-hero__badge-list">
              <li v-for="badge in articleBadges" :key="badge.label">
                <p :class="badge.className">
                  {{ badge.label }}
                </p>
              </li>
            </ul>
            <ul v-if="articleTags.length" class="article-hero__tag-list">
              <li v-for="tag in articleTags" :key="tag.label">
                <a
                  v-if="tag.href"
                  class="fr-tag fr-tag--sm"
                  :href="tag.href"
                >
                  {{ tag.label }}
                </a>
                <p v-else class="fr-tag fr-tag--sm">
                  {{ tag.label }}
                </p>
              </li>
            </ul>
          </div>
          <p v-if="kicker" class="article-hero__kicker">{{ kicker }}</p>
          <h1 class="article-hero__title">{{ h1 }}</h1>
          <p v-if="lead" class="article-hero__lead">
            {{ lead }}
          </p>
        </div>
      </div>
    </header>

    <div class="fr-container article-shell">
      <div class="fr-grid-row fr-grid-row--gutters article-grid">
        <aside class="fr-col-12 fr-col-lg-3 article-toc-col">
          <nav class="fr-sidemenu article-toc " role="navigation" aria-labelledby="article-sidemenu-title">
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
              <div id="article-sidemenu-collapse" :class="['fr-collapse', { 'fr-collapse--expanded': sidemenuExpanded }]">
                <p id="article-sidemenu-title" class="fr-sidemenu__title">
                  Sommaire
                </p>
                <ul class="fr-sidemenu__list">
                  <li v-for="section in sections" :key="section.id" class="fr-sidemenu__item">
                    <a
                      class="fr-sidemenu__link"
                      :aria-current="activeSection === section.id ? 'page' : undefined"
                      :href="`#${section.id}`"
                    >
                      {{ section.label }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </aside>

        <main ref="articleRef" class="fr-col-12 fr-col-lg-9 article-content-col">
          <div class="article-content">
            <slot />
          </div>
        </main>
      </div>
    </div>

    <SimplifionsArticleRelatedTopics :entries="topicEntries" :gradient="heroBackdropGradient" />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import type { BreadcrumbItem } from '@/model/breadcrumb'
import { useCanonicalUrl, useMeta } from '@/utils/seo'
import { articleSectionKey } from './articleSectionKey'
import { articleTopicsRegistryKey, type ArticleTopicEntry } from './articleTopicsRegistryKey'
import SimplifionsArticleRelatedTopics from './SimplifionsArticleRelatedTopics.vue'

type ArticleSection = {
  id: string
  label: string
}

type ArticleAudienceTag = {
  label: string
  href?: string
}

type ArticleCategory = 'guide' | 'liste' | 'palmares' | 'veille'

type ArticleBadge = {
  label: string
  className: string
}

const props = withDefaults(
  defineProps<{
    h1: string
    title?: string
    lead?: string
    kicker?: string
    heroImageSrc?: string
    articleTags?: readonly ArticleAudienceTag[]
    articleCategory?: ArticleCategory
    showNoDevelopmentBadge?: boolean
    breadcrumbLinks?: readonly BreadcrumbItem[]
    // Fond arrière du bandeau. Si aucune image n'est fournie, cette valeur
    // peut être un dégradé CSS ou une couleur DSFR, par exemple :
    // #1b1b35 (blue-france-75), #21213f (blue-france-100),
    // #1e1e1e (grey-75), #242424 (grey-100),
    // var(--background-alt-blue-france), var(--background-contrast-grey).
    heroBackdropGradient?: string
    // Couleur du rectangle clair qui contient le kicker, le titre et le lead.
    // Valeurs recommandées DSFR : var(--background-alt-beige-gris-galet),
    // var(--background-alt-grey), var(--background-contrast-grey),
    // var(--background-elevated-grey).
    heroPanelBackground?: string
  }>(),
  {
    title: undefined,
    lead: '',
    kicker: '',
    heroImageSrc: '',
    articleTags: () => [],
    articleCategory: undefined,
    showNoDevelopmentBadge: false,
    heroBackdropGradient:
      'linear-gradient(135deg, #1b1b35 0%, #1e1e1e 100%)',
    heroPanelBackground: 'var(--background-alt-beige-gris-galet)',
    breadcrumbLinks: () => []
  }
)

useMeta({
  title: () => props.title ?? props.h1,
  description: () => props.lead,
  canonicalUrl: useCanonicalUrl()
})

const sections = ref<ArticleSection[]>([])
provide(articleSectionKey, (id, label) => sections.value.push({ id, label }))

const topicEntries = reactive<ArticleTopicEntry[]>([])
provide(articleTopicsRegistryKey, (slug, pageKey) => {
  if (!topicEntries.some((e) => e.slug === slug)) {
    topicEntries.push({ slug, pageKey })
  }
})

const sidemenuExpanded = ref(true)

const articleRef = ref<HTMLElement | null>(null)
const activeSection = ref('')
let observer: IntersectionObserver | undefined

const heroBackdropStyle = computed(() => ({
  backgroundColor: '#1b1b35',
  backgroundImage: props.heroBackdropGradient
}))

const heroImageStyle = computed(() => ({
  backgroundImage: props.heroImageSrc
    ? `linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.18)), url(${props.heroImageSrc})`
    : 'none'
}))

const heroPanelStyle = computed(() => ({
  backgroundColor: props.heroPanelBackground
}))

const articleTags = computed(() => props.articleTags)
const breadcrumbLinks = computed(() => props.breadcrumbLinks ?? [])

const categoryBadge = computed<ArticleBadge | null>(() => {
  if (!props.articleCategory) return null

  const byCategory: Record<ArticleCategory, ArticleBadge> = {
    guide: {
      label: 'Guide',
      className: 'fr-badge fr-badge--md fr-badge--pink-macaron'
    },
    liste: {
      label: 'Liste',
      className: 'fr-badge fr-badge--md fr-badge--green-menthe'
    },
    palmares: {
      label: 'Palmarès',
      className: 'fr-badge fr-badge--md fr-badge--brown-caramel'
    },
    veille: {
      label: 'Veille',
      className: 'fr-badge fr-badge--md fr-badge--brown-caramel'
    },
  }

  return byCategory[props.articleCategory]
})

const specialBadge = computed<ArticleBadge | null>(() => {
  if (!props.showNoDevelopmentBadge) return null

  return {
    label: 'Sans développement',
    className: 'fr-badge fr-badge--sm fr-badge--beige-gris-galet fr-badge--icon-left fr-icon-flashlight-line'
  }
})

const articleBadges = computed(() =>
  [categoryBadge.value, specialBadge.value].filter((badge): badge is ArticleBadge => badge !== null)
)

const hasMeta = computed(() => articleTags.value.length > 0 || articleBadges.value.length > 0)

onMounted(() => {
  activeSection.value = sections.value[0]?.id ?? ''

  const container = articleRef.value
  if (!container) return

  const targets = sections.value
    .map((section) => container.querySelector<HTMLElement>(`#${section.id}`))
    .filter((el): el is HTMLElement => el !== null)

  if (!targets.length || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target instanceof HTMLElement && visible.target.id) {
        activeSection.value = visible.target.id
      }
    },
    {
      root: null,
      threshold: [0.1, 0.2, 0.35, 0.5]
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
  padding: 0 0 1rem;
  overflow: hidden;
}

.article-hero__backdrop {
  position: absolute;
  inset: 0 0 60px 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.article-hero__media {
  position: absolute;
  inset: 0 0 60px 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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

.article-hero__breadcrumb :deep(nav) {
  margin-bottom: 1rem;
}

.article-hero__panel {
  position: relative;
  z-index: 1;
  width: min(75%, 64rem);
  padding: 1.5rem 1.75rem 1.75rem;
  color: var(--text-title-grey);
  border-radius: 0;
  box-shadow: none;
}

.article-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.article-hero__tag-list,
.article-hero__badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.article-hero__tag-list > li,
.article-hero__badge-list > li {
  display: flex;
}

.article-hero__tag-list .fr-tag,
.article-hero__badge-list .fr-badge {
  margin: 0;
}

.article-hero__kicker {
  display: inline-flex;
  align-items: center;
  margin: 0 0 0.875rem;
  padding: 0.3rem 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-title-blue-france);
  background-color: var(--background-default-grey);
  border-radius: 999px;
}

.article-hero__title {
  margin: 0;
  font-size: clamp(2rem, 3.8vw, 3.4rem);
  line-height: 1.05;
}

.article-hero__lead {
  margin: 1.15rem 0 0;
  font-size: clamp(1.08rem, 1.2vw, 1.28rem);
  line-height: 1.65;
  color: var(--text-default-grey);
}

.article-shell {
  padding-top: 2rem;
  padding-bottom: 2rem;
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

@media (max-width: 62rem) {
  .article-hero {
    min-height: 16rem;
    padding-bottom: 0.75rem;
  }

  .article-hero__backdrop {
    inset: 0 0 60px 0;
  }

  .article-hero__inner {
    margin-top: 4.5rem;
  }

  .article-hero__breadcrumb {
    padding-top: 0.75rem;
  }

  .article-hero__panel {
    width: 100%;
    padding: 1.1rem 1.1rem 1.25rem;
  }

  .article-hero__meta {
    margin-bottom: 0.75rem;
  }

  .article-hero__title {
    max-width: none;
    font-size: clamp(1.8rem, 7vw, 2.5rem);
  }

  .article-hero__lead {
    font-size: 1.05rem;
  }

  .article-toc-col {
    position: static;
    top: auto;
    height: auto;
    margin-bottom: 1rem;
  }

  .article-content {
    max-width: none;
  }
}

@media (min-width: 90rem) {
  .article-hero__panel {
    width: min(66.666%, 58rem);
  }
}
</style>

<template>
  <div class="fr-card fr-card--sm fr-enlarge-link simplifions-article-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <div
          v-if="article.tags.length"
          class="fr-card__start simplifions-article-card__tags-zone"
        >
          <ul class="fr-tags-group simplifions-article-card__tags">
            <li
              v-for="tag in article.tags"
              :key="tag.label"
            >
              <DsfrTag
                :label="tag.label"
                :link="tag.href"
                small
              />
            </li>
          </ul>
        </div>

        <h3 class="fr-card__title">
          <RouterLink
            class="fr-card__link"
            :to="article.to"
          >
            {{ article.title }}
          </RouterLink>
        </h3>

        <p class="fr-card__desc">
          {{ article.description }}
        </p>
      </div>
    </div>

    <div class="fr-card__header simplifions-article-card__header">
      <div class="fr-card__img simplifions-article-card__media">
        <img
          class="fr-responsive-img simplifions-article-card__image"
          :src="article.imageSrc"
          alt=""
        >
      </div>

      <div v-if="hasCustomImage" class="simplifions-article-card__image-overlay" />

      <div class="simplifions-article-card__overlays">
        <ul
          v-if="article.badges.length"
          class="fr-badges-group simplifions-article-card__badges"
        >
          <li
            v-for="badge in article.badges"
            :key="badge.label"
          >
            <p :class="badge.className">{{ badge.label }}</p>
          </li>
        </ul>

        <img
          :src="pictoSrc"
          class="simplifions-article-card__picto"
          aria-hidden="true"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SimplifionsArticleCard, SimplifionsArticleCategory } from '../model/articles'
import PictoGuideRaw from '@gouvfr/dsfr/dist/artwork/pictograms/leisure/catalog.svg?raw'
import PictoListeRaw from '@gouvfr/dsfr/dist/artwork/pictograms/document/document.svg?raw'
import PictoPalmaresRaw from '@gouvfr/dsfr/dist/artwork/pictograms/system/success.svg?raw'
import PictoVeilleRaw from '@gouvfr/dsfr/dist/artwork/pictograms/document/document-search.svg?raw'

const toDataUrl = (svgRaw: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgRaw.replace(/#E1000F/gi, '#3f3a20'))}`

const PICTO_BY_CATEGORY: Record<SimplifionsArticleCategory, string> = {
  guide: toDataUrl(PictoGuideRaw),
  liste: toDataUrl(PictoListeRaw),
  palmares: toDataUrl(PictoPalmaresRaw),
  veille: toDataUrl(PictoVeilleRaw),
}

const props = defineProps<{
  article: SimplifionsArticleCard
}>()

const pictoSrc = computed(
  () => props.article.articleCategory
    ? PICTO_BY_CATEGORY[props.article.articleCategory]
    : PICTO_BY_CATEGORY.guide
)

const hasCustomImage = computed(() => !props.article.imageSrc.startsWith('data:'))
</script>

<style scoped>
.simplifions-article-card {
  height: 100%;
}

.simplifions-article-card__header {
  position: relative;
}

.simplifions-article-card__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.simplifions-article-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.simplifions-article-card__overlays {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  z-index: 2;
  pointer-events: none;
}

.simplifions-article-card__image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.55);
  z-index: 1;
  pointer-events: none;
}

.simplifions-article-card__picto {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6rem;
  height: 6rem;
}

.simplifions-article-card__badges,
.simplifions-article-card__tags {
  margin: 0;
  pointer-events: auto;
}

.simplifions-article-card__badges li,
.simplifions-article-card__tags li {
  margin-right: 0.05rem;
  margin-bottom: 0.05rem;
  line-height: 1;
}
</style>

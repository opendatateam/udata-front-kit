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
                tag-name="span"
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
          :alt="article.imageAlt ?? ''"
        >
      </div>

      <div
        v-if="article.badges.length"
        class="simplifions-article-card__overlays"
      >
        <ul class="fr-badges-group simplifions-article-card__badges">
          <li
            v-for="badge in article.badges"
            :key="badge.label"
          >
            <DsfrBadge
              :label="badge.label"
              small
              no-icon
              :class="badge.className"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DsfrBadge, DsfrTag } from '@gouvminint/vue-dsfr'

import type { SimplifionsArticleCard } from '../model/articles'

defineProps<{
  article: SimplifionsArticleCard
}>()
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
  z-index: 1;
  pointer-events: none;
}

.simplifions-article-card__badges,
.simplifions-article-card__tags {
  margin: 0;
  pointer-events: auto;
}

.simplifions-article-card__badges li,
.simplifions-article-card__tags li {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.simplifions-article-card :deep(.fr-card__content) {
  text-align: left;
}

.simplifions-article-card :deep(.fr-card__title) {
  text-align: left;
}

.simplifions-article-card :deep(.fr-card__desc) {
  text-align: left;
}
</style>

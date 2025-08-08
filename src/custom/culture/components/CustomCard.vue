<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  imgSrc?: string
  link?: string
  altImg?: string
  titleLinkAttrs?: Record<string, any>
  ctaLabel?: string
}

const { link, ctaLabel } = defineProps<Props>()

const parseMarkdown = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="custom-link">$1</a>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <div class="fr-card fr-card--no-arrow">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          {{ title }}
        </h3>
        <div
          v-if="description"
          class="fr-card__desc custom-links"
          v-html="parseMarkdown(description)"
        ></div>
      </div>
      <div v-if="ctaLabel || link" class="fr-card__cta">
        <a v-if="ctaLabel && link" :href="link" class="cta-label-link"
          >{{ ctaLabel }} <span class="cta-arrow">→</span></a
        >
        <a v-else :href="link" class="cta-arrow-link">Voir →</a>
      </div>
    </div>
    <div v-if="imgSrc" class="fr-card__header">
      <div class="fr-card__img">
        <img :src="imgSrc" :alt="altImg" class="fr-responsive-img" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fr-card {
  border: 1px solid var();
  background-color: var(--grey-1000-50);
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.clickable-card {
  cursor: pointer;
}

.clickable-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.fr-card__body {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fr-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 0.5rem;
}

.fr-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.fr-card__desc {
  color: var(--text-default-grey);
  font-size: 0.75rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.fr-card__desc :deep(strong) {
  font-weight: 700;
}

.fr-card__desc :deep(a) {
  color: var(--text-title-grey) !important;
  text-decoration: none !important;
  transition: text-decoration 0.2s ease;
}

.fr-card__cta {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  align-self: flex-end;
  order: 999;
}

.cta-label-link,
.cta-arrow-link {
  color: var(--text-action-high-blue-france) !important;
  text-decoration: none !important;
  transition: color 0.2s ease;
}

.cta-label-link:hover,
.cta-arrow-link:hover {
  color: var(--text-action-high-blue-france-hover) !important;
  text-decoration: none !important;
}

.fr-card__header {
  order: -1;
}

.fr-card__img {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.fr-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .fr-card__body {
    padding: 1rem;
  }

  .fr-card__img {
    height: 150px;
  }
}
</style>

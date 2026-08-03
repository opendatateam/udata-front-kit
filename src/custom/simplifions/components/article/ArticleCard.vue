<template>
  <div class="fr-card fr-enlarge-link fr-card--shadow">
    <div class="fr-card__body">
      <div class="fr-card__content fr-px-2w fr-pt-3w">
        <div
          v-if="groupedKeywords.audienceKeywords.length"
          class="fr-card__start"
        >
          <p class="fr-card__detail fr-icon-user-line">{{ audienceDetail }}</p>
        </div>
        <h3 class="fr-card__title fr-text--lead fr-mb-0">
          <router-link :to="`/articles/${article.slug}`">{{
            article.h1
          }}</router-link>
        </h3>
        <p class="fr-card__desc fr-text--md">{{ article.description }}</p>
        <div class="fr-card__end">
          <ul class="fr-tags-group">
            <li
              v-for="keyword in groupedKeywords.otherKeywords"
              :key="keyword.label"
            >
              <p class="fr-tag fr-tag--sm">{{ keyword.label }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="fr-card__header">
      <div class="fr-card__img fr-mx-0">
        <img
          v-if="article.imageSrc"
          :src="article.imageSrc"
          :alt="article.h1"
          class="card-image fr-responsive-img fr-ratio-16x9"
        />
        <div
          v-else
          class="card-image-fallback fr-ratio-16x9"
          :style="{ backgroundImage: article.heroBackdropGradient }"
        ></div>
      </div>
      <div
        v-if="
          groupedKeywords.articleTypeKeywords.length ||
          groupedKeywords.dataTypeKeywords.length
        "
        class="fr-badges-group"
      >
        <p
          v-for="keyword in groupedKeywords.articleTypeKeywords"
          :key="keyword.label"
          class="fr-badge fr-badge--sm"
        >
          {{ keyword.label }}
        </p>
        <span
          v-if="
            groupedKeywords.articleTypeKeywords.length &&
            groupedKeywords.dataTypeKeywords.length
          "
          class="badge-group-break"
          aria-hidden="true"
        ></span>
        <p
          v-for="keyword in groupedKeywords.dataTypeKeywords"
          :key="keyword.label"
          class="fr-badge fr-badge--sm fr-badge--blue-ecume"
        >
          {{ keyword.label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  groupArticleKeywords,
  joinKeywordLabels,
  type ArticleMeta
} from '../../model/articles'

const props = defineProps<{ article: ArticleMeta }>()

const groupedKeywords = computed(() =>
  groupArticleKeywords(props.article.articleKeywords)
)
const audienceDetail = computed(() =>
  joinKeywordLabels(groupedKeywords.value.audienceKeywords)
)
</script>

<style scoped>
.card-image,
.card-image-fallback {
  max-height: 250px;
}

.card-image-fallback {
  background-position: center;
  background-size: cover;
}

.badge-group-break {
  flex-basis: 100%;
  height: 0;
}
</style>

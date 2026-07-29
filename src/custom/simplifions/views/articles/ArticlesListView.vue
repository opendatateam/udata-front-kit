<template>
  <div class="fr-container fr-py-8v">
    <h1>Articles</h1>


    <div class="fr-grid-row fr-grid-row--gutters">
      <aside class="fr-col-12 fr-col-lg-3">
        <div v-for="group in keywordGroups" :key="group.category" class="fr-mb-3w">
          <p class="fr-text--bold fr-mb-1w">{{ group.category }}</p>
          <ul class="fr-tags-group fr-mb-0">
            <li v-for="keyword in group.keywords" :key="keyword.label">
              <button
                class="fr-tag"
                :aria-pressed="selectedKeywords.includes(keyword.label)"
                :disabled="keyword.count === 0"
                @click="toggleKeyword(keyword.label)"
              >
                {{ keyword.label }} ({{ keyword.count }})
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <div class="fr-col-12 fr-col-lg-9">
        <p v-if="filteredArticles.length === 0" class="fr-text--lg">
          Aucun article ne correspond aux tags sélectionnés.
        </p>
        <div v-else class="fr-grid-row fr-grid-row--gutters">
          <div
            v-for="article in filteredArticles"
            :key="article.slug"
            class="fr-col-12 fr-col-md-6 fr-col-lg-4"
          >
            <ArticleCard :article="article" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCanonicalUrl, useMeta } from '@/utils/seo'
import ArticleCard from '../../components/article/ArticleCard.vue'
import { ARTICLE_KEYWORD_CATEGORIES, ARTICLE_KEYWORDS, articles } from '../../model/articles'

useMeta({
  title: () => 'Articles',
  description: () =>
    'Guides et explications pour comprendre et intégrer les API utiles à la simplification de vos démarches.',
  canonicalUrl: useCanonicalUrl()
})
const selectedKeywords = ref<string[]>([])

const keywordGroups = computed(() => {
  const counts = new Map<string, number>()
  for (const keyword of articles.flatMap((article) => article.articleKeywords)) {
    counts.set(keyword.label, (counts.get(keyword.label) ?? 0) + 1)
  }
  return ARTICLE_KEYWORD_CATEGORIES.map((category) => ({
    category,
    keywords: Object.values(ARTICLE_KEYWORDS)
      .filter((keyword) => keyword.category === category)
      .map((keyword) => ({ label: keyword.label, count: counts.get(keyword.label) ?? 0 }))
  })).filter((group) => group.keywords.length > 0)
})

const filteredArticles = computed(() =>
  selectedKeywords.value.length === 0
    ? articles
    : articles.filter((article) =>
        article.articleKeywords.some((keyword) => selectedKeywords.value.includes(keyword.label))
      )
)

function toggleKeyword(keyword: string) {
  selectedKeywords.value = selectedKeywords.value.includes(keyword)
    ? selectedKeywords.value.filter((k) => k !== keyword)
    : [...selectedKeywords.value, keyword]
}
</script>

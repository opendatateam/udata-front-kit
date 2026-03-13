<script setup lang="ts">
import config from '@/config'
import type { EcologieHomepageConf } from '@/custom/ecospheres/model/config'

const homepage = config.ecospheres.homepage as EcologieHomepageConf | undefined
const aboutText = homepage?.about_text ?? ''
const news = homepage?.news ?? []
</script>

<template>
  <section class="fr-container--fluid about-news-section fr-py-16v">
    <div class="fr-container">
      <div class="about-news-grid">
        <div>
          <h2>À propos</h2>
          <p class="about-text">{{ aboutText }}</p>
          <RouterLink
            :to="{ name: 'about' }"
            class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
          >
            En savoir plus sur ce site
          </RouterLink>
        </div>
        <div>
          <h2 class="news-header-title">Actualités</h2>
          <ul class="news-list" role="list">
            <li v-for="item in news" :key="item.title" class="news-item">
              <p class="news-date fr-text--sm">{{ item.date }}</p>
              <a
                v-if="item.href"
                :href="item.href"
                class="news-title fr-link"
                >{{ item.title }}</a
              >
              <p v-else class="news-title">{{ item.title }}</p>
            </li>
          </ul>
          <div class="news-cta fr-mt-4v">
            <a
              href="https://grist.numerique.gouv.fr/o/ecolabservicesdonnees/forms/mCtZDvP6vKbMcorvXM7sGK/55"
              target="_blank"
              rel="noopener noreferrer"
              class="fr-btn fr-btn--secondary fr-icon-mail-line fr-btn--icon-left"
            >
              Abonnez-vous à la lettre d'information
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-text {
  font-weight: 700;
  font-size: 1.25rem;
}

.about-news-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.news-header-title {
  font-size: 1.5rem;
}

.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.news-item {
  border-bottom: 1px solid var(--border-default-grey);
  padding-bottom: 1rem;

  &:last-child {
    border-bottom: none;
  }
}

.news-date {
  color: var(--text-mention-grey);
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
}

.news-title {
  margin: 0;
  font-weight: 400;
  font-size: 1.125rem;
}
</style>

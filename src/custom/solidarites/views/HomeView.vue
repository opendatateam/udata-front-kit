<script setup lang="ts">
import SubSectionCards from '@/components/sections/SubSectionCards.vue'
import config from '@/config'
import HomeContributors from '@/custom/solidarites/components/HomeContributors.vue'
import type {
  NewsItemConf,
  SelectionsItemConf,
  WebinairesConf
} from '@/custom/solidarites/model/config'
import { useMeta } from '@/utils/seo'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const news = config.solidarites.news as NewsItemConf | undefined
const limitedSubSection = news?.sub_section_cards
  ? {
      ...news.sub_section_cards,
      cards: news.sub_section_cards.cards?.slice(0, 3) || []
    }
  : undefined
const webinaires = config.solidarites.webinaires as WebinairesConf | undefined
const selections = config.solidarites.selections as
  | SelectionsItemConf[]
  | undefined
const firstWebinaire = webinaires?.webinaires[0]

useMeta({
  description: () => config.website.homepage.meta_description,
  canonicalUrl: () => window.location.origin
})

const router = useRouter()
const searchQuery = ref('')

const doSearch = (q: string) => {
  router
    .push({ name: 'datasets', query: { q } })
    .then(() => (searchQuery.value = ''))
}
</script>

<template>
  <div>
    <section class="hero-section fr-pt-12v fr-pb-10v">
      <div class="fr-container">
        <div class="fr-grid-row">
          <div class="fr-col-12 fr-col-lg-9 hero-content">
            <h1 class="main-title-v2 fr-h2 text-left">
              Portail du réseau des producteurs de données de solidarités
            </h1>
            <p class="fr-text--lead fr-mb-6w">
              Solidarites.data.gouv.fr vise à référencer, héberger et diffuser
              les données publiques relatives à la solidarité en France. Vous y
              trouverez des données téléchargeables et utilisables de manière
              libre et gratuite.
            </p>

            <div class="big-search">
              <DsfrSearchBar
                id="big-select-search"
                v-model="searchQuery"
                label="Recherchez une donnée"
                :placeholder="config.website.header.search.placeholder"
                button-text="Rechercher"
                :large="true"
                @search="doSearch"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="fr-container fr-pt-6w">
      <h2 class="section-h2">La sélection du moment</h2>
      <div class="fr-my-3w fr-grid-row fr-grid-row--gutters">
        <div v-for="item in selections" :key="item.title" class="fr-col-4">
          <DsfrCard
            :title="item.title"
            :link="item.href"
            :title-link-attrs="{}"
          />
        </div>
      </div>
    </section>

    <section v-if="firstWebinaire" class="fr-container fr-py-8w">
      <h2>Prochains webinaires</h2>
      <DsfrCard
        alt-img="altImg"
        :description="firstWebinaire.description"
        :img-src="firstWebinaire.img"
        :end-detail="firstWebinaire.date"
        :link="firstWebinaire.href"
        :title="firstWebinaire.title"
        :title-link-attrs="{}"
        horizontal
        img-ratio="md"
      />
      <div class="fr-grid-row fr-col-12 justify-end fr-mt-5w">
        <a href="/webinaires" class="fr-btn fr-btn--secondary">
          Voir tous les webinaires
        </a>
      </div>
    </section>

    <section v-if="limitedSubSection" class="fr-container fr-py-2w">
      <div class="fr-grid-row fr-col-12">
        <SubSectionCards :subsection="limitedSubSection" />
      </div>
      <div class="fr-grid-row fr-col-12 justify-end fr-mt-5w">
        <a href="/actualites" class="fr-btn fr-btn--secondary"
          >Voir toutes les actualités</a
        >
      </div>
    </section>
  </div>
  <HomeContributors />
</template>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('../assets/home-background.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    z-index: -1;
    pointer-events: none;
  }

  & > .fr-container {
    position: relative;
    z-index: 1;
  }
}

.hero-content {
  width: 100%;
  background-color: #fff;
  padding: 1.5rem;

  /* fr-lg */
  @media (min-width: 992px) {
    padding: 4rem;
    margin-left: -4rem;
  }
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
</style>

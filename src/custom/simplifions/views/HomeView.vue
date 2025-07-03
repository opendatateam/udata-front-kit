<script setup lang="ts">
import SubSectionButtons from '@/components/sections/SubSectionButtons.vue'
import SubSectionCards from '@/components/sections/SubSectionCards.vue'
import SubSectionDatasets from '@/components/sections/SubSectionDatasets.vue'
import SubSectionTiles from '@/components/sections/SubSectionTiles.vue'
import config from '@/config'
import { fromMarkdown } from '@/utils'

const sectionsHomePage = config.website.homepage.sections
const colorsBanner = config.website.home_banner_colors
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="banner"
    :style="
      'background: linear-gradient(0.25turn, ' +
      colorsBanner[0] +
      ', ' +
      colorsBanner[1] +
      ', ' +
      colorsBanner[2] +
      ');'
    "
  >
    <div class="fr-container">
      <h1 class="main-title fr-mb-3v">
        Acteurs publics, utilisez la donnée pour simplifier vos services !
      </h1>
      <div class="fr-mt-5w">
        <div class="subtitle fr-text--alt fr-mb-10w">
          <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-content-media__img fr-col-lg-2 fr-col-4">
              <img
                class="fr-responsive-img"
                src="/simplifions/assets/accueil-picto-ecosystem.png"
                alt=""
                style="display: block; width: 100%; height: auto"
              />
            </div>
            <div
              class="fr-col-lg-8 fr-col-12"
              style="
                font-family: Marianne, arial, sans-serif !important;
                font-style: normal;
              "
            >
              <p class="fr-text--lead">
                Simplifiez les démarches et services des citoyens, entreprises
                et associations en récupérant pour eux leurs informations
                administratives grâce aux API et aux données ! Vous gagnerez
                aussi du temps !
              </p>

              <a
                class="fr-btn fr-mt-1v fr-mr-2w fr fr-btn--lg"
                href="/cas-d-usages"
                >Tous les cas d'usages</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-for="item in sectionsHomePage" :key="item">
    <div class="fr-container hero-text">
      <h4 v-if="item.title">{{ item.title }}</h4>
      <span v-html="fromMarkdown(item.content)"></span>
      <div class="fr-mt-4w fr-col-md-12 datagouv-components">
        <SubSectionDatasets
          v-if="item.sub_section_datasets"
          :subsection="item.sub_section_datasets"
        />
        <SubSectionCards
          v-if="item.sub_section_cards"
          :subsection="item.sub_section_cards"
        />
        <SubSectionTiles
          v-if="item.sub_section_tiles"
          :subsection="item.sub_section_tiles"
        />
        <SubSectionButtons
          v-if="item.sub_section_buttons"
          :subsection="item.sub_section_buttons"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fr-container {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.banner {
  padding-top: 5%;
  padding-bottom: 5%;
  position: relative;
}
.main-title {
  text-align: left;
  font-size: 48px;
  line-height: 50px;
  font-weight: 800;
}
.subtitle {
  text-align: left;
  font-style: italic;
  font-size: 20px;
  line-height: 28px;
}
.hero-text {
  margin-top: 30px;
  text-align: left;
}
</style>

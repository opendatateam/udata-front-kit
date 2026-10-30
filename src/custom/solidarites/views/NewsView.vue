<script setup lang="ts">
import SubSectionCards from '@/components/sections/SubSectionCards.vue'
import config from '@/config'
import type { NewsItemConf } from '@/custom/solidarites/model/config'

const news = config.solidarites.news as NewsItemConf
</script>

<template>
  <section class="fr-container--fluid fr-pt-12v fr-pb-0 fr-pt-lg-16v">
    <h1 class="fr-container">Nos actualités</h1>

    <div class="fr-container news-list">
      <div class="fr-grid-row fr-col-12">
        <SubSectionCards :subsection="news?.sub_section_cards" />
      </div>
    </div>
  </section>
</template>

<style scoped>
h2 {
  font-size: 1.75rem;
}

.news-list {
  & > div:nth-child(2) {
    background-color: #e8edff;
  }
}
</style>

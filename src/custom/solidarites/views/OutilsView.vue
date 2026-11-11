<script setup lang="ts">
import config from '@/config'
import type { OutilsConf } from '@/custom/solidarites/model/config'

const outils = config.solidarites.outils as OutilsConf | undefined
const outilsItems = outils?.outils ?? []

const getImageUrl = (filename: string) => {
  if (!filename) return ''
  return new URL(`../assets/logos/${filename}`, import.meta.url).href
}
</script>

<template>
  <section class="fr-container--fluid fr-pt-12v fr-pb-0 fr-pt-lg-16v">
    <div class="fr-container">
      <div>
        <h1>Outils d’exploration</h1>

        <div>
          <div
            v-for="item in outilsItems"
            :key="item.title"
            class="fr-my-6w fr-grid-row fr-grid-row--gutters"
          >
            <div class="fr-col-12 fr-col-lg-3">
              <img
                v-if="item.img"
                class="outil-img fr-col-12"
                :src="getImageUrl(item.img)"
                alt=""
              />
            </div>
            <div class="fr-col-12 fr-col-lg-9">
              <h2>{{ item.title }}</h2>
              <p>{{ item.description }}</p>
              <a
                :href="item.href"
                target="_blank"
                rel="external noreferrer"
                class="fr-btn fr-btn--secondary"
                >{{ item.href_title }}</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.outil-img {
  max-height: 160px;
  object-fit: contain;
}
</style>

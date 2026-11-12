<script setup lang="ts">
import config from '@/config'
import type { WebinairesConf } from '@/custom/solidarites/model/config'

const webinaires = config.solidarites.webinaires as WebinairesConf | undefined
const webinairesItems = webinaires?.webinaires ?? []
</script>

<template>
  <section class="fr-container--fluid fr-pt-12v fr-pb-0 fr-pt-lg-16v">
    <div>
      <div>
        <h1 class="fr-container">Nos webinaires</h1>

        <div class="webinaires-list">
          <div
            v-for="item in webinairesItems"
            :key="item.title"
            class="fr-py-6w"
          >
            <div class="fr-container">
              <div class="fr-grid-row fr-grid-row--gutters">
                <div class="fr-col-12 fr-col-lg-8">
                  <h2>Webinaire - {{ item.title }}</h2>
                  <h3>{{ item.date }}</h3>
                  <p>{{ item.description }}</p>
                  <a
                    :href="item.href"
                    target="_blank"
                    rel="external noreferrer"
                    class="fr-btn fr-btn--secondary"
                    >{{ item.href_title }}</a
                  >
                </div>
                <div class="fr-col-12 fr-col-lg-4">
                  <img
                    v-if="item.img"
                    class="webinaire-img fr-col-12"
                    :src="item.img"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
h2 {
  font-size: 1.75rem;
}

.webinaires-list {
  & > div:nth-child(2) {
    background-color: #e8edff;
  }
}

.webinaire-img {
  max-height: 250px;
}
</style>

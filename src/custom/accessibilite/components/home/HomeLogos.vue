<script lang="ts" setup>
import config from '@/config'

interface Logos {
  name: string
  logo: string
}

const sponsors: Logos[] = config.accessibilite.homepage.sponsors
const partners: Logos[] = config.accessibilite.homepage.partners
</script>

<template>
  <section class="partners fr-py-7w">
    <div class="fr-container">
      <h2>Une plateforme web portée par&nbsp;:</h2>
      <ul class="fr-mt-5w" role="list">
        <li v-for="sponsor in sponsors" :key="sponsor.name">
          <picture>
            <source
              :srcset="`/static/accessibilite/assets/logos/${sponsor.logo}.avif`"
              type="image/avif"
            />
            <img
              :src="`/static/accessibilite/assets/logos/${sponsor.logo}.jpg`"
              :alt="sponsor.name"
            />
          </picture>
        </li>
      </ul>
      <h3 class="fr-mt-5w">En partenariat avec&nbsp;:</h3>
      <ul class="fr-mt-4w" role="list">
        <li v-for="partner in partners" :key="partner.name">
          <picture>
            <source
              :srcset="`/static/accessibilite/assets/logos/${partner.logo}.avif`"
              type="image/avif"
            />
            <img
              :src="`/static/accessibilite/assets/logos/${partner.logo}.jpg`"
              :alt="partner.name"
            />
          </picture>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
ul {
  display: flex;
  flex-flow: row wrap;
  gap: 1.25rem;
  align-items: center;
}
li img {
  max-block-size: 80px;
  max-inline-size: 120px;
}
</style>

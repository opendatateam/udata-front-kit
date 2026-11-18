<script setup lang="ts">
import caf from '@/custom/solidarites/assets/logos/caf.png'
import cnav from '@/custom/solidarites/assets/logos/cnav.png'
import cnsa from '@/custom/solidarites/assets/logos/cnsa.png'
import dgcs from '@/custom/solidarites/assets/logos/dgcs.png'
import drees from '@/custom/solidarites/assets/logos/drees.png'
import ss from '@/custom/solidarites/assets/logos/ss.png'

const contributors = [
  {
    name: 'Sécurité Sociale',
    logo_url: ss,
    href: 'https://www.securite-sociale.fr'
  },
  { name: 'CNAV', logo_url: cnav, href: 'https://www.lassuranceretraite.fr' },
  {
    name: 'DGCS',
    logo_url: dgcs,
    href: 'https://solidarites.gouv.fr/la-direction-generale-de-la-cohesion-sociale-dgcs'
  },
  { name: 'CNSA', logo_url: cnsa, href: 'https://www.cnsa.fr' },
  {
    name: 'DREES',
    logo_url: drees,
    href: 'https://drees.solidarites-sante.gouv.fr'
  },
  { name: 'CAF', logo_url: caf, href: 'https://www.caf.fr/' }
]
</script>

<template>
  <section
    class="fr-container--fluid contributors-section fr-py-12v fr-pb-lg-30v"
  >
    <div class="fr-container">
      <h2 class="contributors-title">
        Les plateformes du réseau des producteurs de données de solidarités
      </h2>
      <ul class="contributors-grid" role="list">
        <li v-for="contributor in contributors" :key="contributor.name">
          <a
            :href="contributor.href"
            target="_blank"
            rel="noopener noreferrer"
            class="contributor-item"
            :title="contributor.name"
          >
            <img
              :src="contributor.logo_url"
              :alt="contributor.name"
              class="contributor-logo"
            />
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.contributors-title {
  margin-bottom: 2rem;
}

.contributors-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 2rem 3rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.contributor-item {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  background-image: none !important;

  &::after {
    display: none !important;
  }
}

.contributor-logo {
  max-height: 110px;
  object-fit: contain;
}
</style>

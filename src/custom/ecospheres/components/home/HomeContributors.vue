<script setup lang="ts">
import ademe from '@/custom/ecospheres/assets/logos/ademe.png'
import bordeaux from '@/custom/ecospheres/assets/logos/bordeaux.png'
import brgm from '@/custom/ecospheres/assets/logos/brgm.png'
import cerema from '@/custom/ecospheres/assets/logos/cerema.png'
import datagouvfr from '@/custom/ecospheres/assets/logos/datagouvfr.png'
import docurba from '@/custom/ecospheres/assets/logos/docurba.png'
import ign from '@/custom/ecospheres/assets/logos/ign.png'
import meteoFrance from '@/custom/ecospheres/assets/logos/meteo-france.png'
import metropoleLyon from '@/custom/ecospheres/assets/logos/metropole-lyon.png'
import ministereMte from '@/custom/ecospheres/assets/logos/ministere-mte.png'
import ofb from '@/custom/ecospheres/assets/logos/ofb.png'
import ore from '@/custom/ecospheres/assets/logos/ore.png'
import prefetAra from '@/custom/ecospheres/assets/logos/prefet-ara.png'

const contributors = [
  {
    name: 'Météo-France',
    logo_url: meteoFrance,
    href: 'https://www.meteofrance.fr'
  },
  { name: 'BRGM', logo_url: brgm, href: 'https://www.brgm.fr' },
  { name: 'Cerema', logo_url: cerema, href: 'https://www.cerema.fr' },
  { name: 'ADEME', logo_url: ademe, href: 'https://www.ademe.fr' },
  { name: 'IGN', logo_url: ign, href: 'https://www.ign.fr' },
  { name: 'OFB', logo_url: ofb, href: 'https://www.ofb.gouv.fr' },
  {
    name: 'Métropole Grand Lyon',
    logo_url: metropoleLyon,
    href: 'https://www.grandlyon.com'
  },
  {
    name: 'Bordeaux Métropole',
    logo_url: bordeaux,
    href: 'https://www.bordeaux-metropole.fr'
  },
  { name: 'ORE', logo_url: ore, href: 'https://www.agenceore.fr' },
  { name: 'Docurba', logo_url: docurba, href: 'https://docurba.beta.gouv.fr' },
  {
    name: 'data.gouv.fr',
    logo_url: datagouvfr,
    href: 'https://www.data.gouv.fr'
  },
  {
    name: 'Ministères transition écologique aménagement du territoire transports ville et logement',
    logo_url: ministereMte,
    href: 'https://www.ecologie.gouv.fr'
  },
  {
    name: 'Préfet Auvergne-Rhône-Alpes',
    logo_url: prefetAra,
    href: 'https://www.prefectures-regions.gouv.fr/auvergne-rhone-alpes'
  }
]
</script>

<template>
  <section
    class="fr-container--fluid contributors-section fr-py-12v fr-pb-lg-30v"
  >
    <div class="fr-container">
      <h2 class="contributors-title">Merci aux contributeurs</h2>
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
  text-align: center;
  margin-bottom: 2rem;
}

.contributors-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
  max-height: 65px;
  max-width: 125px;
  object-fit: contain;
}
</style>

<script setup lang="ts">
const BASE = 'src/custom/ecospheres/assets/logos'
const contributors = [
  {
    name: 'Météo-France',
    logo_url: `${BASE}/meteo-france.png`,
    href: 'https://www.meteofrance.fr'
  },
  { name: 'BRGM', logo_url: `${BASE}/brgm.png`, href: 'https://www.brgm.fr' },
  {
    name: 'Cerema',
    logo_url: `${BASE}/cerema.png`,
    href: 'https://www.cerema.fr'
  },
  {
    name: 'ADEME',
    logo_url: `${BASE}/ademe.png`,
    href: 'https://www.ademe.fr'
  },
  { name: 'IGN', logo_url: `${BASE}/ign.png`, href: 'https://www.ign.fr' },
  { name: 'OFB', logo_url: `${BASE}/ofb.png`, href: 'https://www.ofb.gouv.fr' },
  {
    name: 'Métropole Grand Lyon',
    logo_url: `${BASE}/metropole-lyon.png`,
    href: 'https://www.grandlyon.com'
  },
  {
    name: 'Bordeaux Métropole',
    logo_url: `${BASE}/bordeaux.png`,
    href: 'https://www.bordeaux-metropole.fr'
  },
  {
    name: 'ORE',
    logo_url: `${BASE}/ore.png`,
    href: 'https://www.agenceore.fr'
  },
  {
    name: 'Docurba',
    logo_url: `${BASE}/docurba.png`,
    href: 'https://docurba.beta.gouv.fr'
  },
  {
    name: 'data.gouv.fr',
    logo_url: `${BASE}/datagouvfr.png`,
    href: 'https://www.data.gouv.fr'
  },
  {
    name: 'Ministères transition écologique aménagement du territoire transports ville et logement',
    logo_url: `${BASE}/ministere-mte.png`,
    href: 'https://www.ecologie.gouv.fr'
  },
  {
    name: 'Préfet Auvergne-Rhône-Alpes',
    logo_url: `${BASE}/prefet-ara.png`,
    href: 'https://www.prefectures-regions.gouv.fr/auvergne-rhone-alpes'
  }
]
</script>

<template>
  <section class="fr-container--fluid contributors-section fr-py-8v">
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

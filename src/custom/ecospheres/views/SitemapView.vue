<script lang="ts" setup>
import GenericContainer from '@/components/GenericContainer.vue'

const links = [{ to: '/', text: 'Accueil' }, { text: 'Plan du site' }]

const routes = [
  {
    name: 'Accueil',
    path: '/'
  },
  {
    name: 'Bouquets',
    path: '/bouquets'
  },
  {
    name: 'Jeux de données',
    path: '/datasets'
  },
  {
    name: 'Organisations',
    path: '/organizations'
  },
  {
    name: 'À propos',
    path: '/about'
  },
  {
    name: 'Conditions générales d’utilisation',
    path: '/terms'
  },
  {
    name: 'Accessibilité',
    path: '/accessibility'
  }
]
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer>
    <section class="sitemap">
      <h1>Plan du site</h1>
      <ul class="fr-mt-10v fr-p-0" role="list">
        <li v-for="(link, index) of routes" :key="index" class="fr-mt-10v">
          <h2>
            <router-link :to="link.path">{{ link.name }}</router-link>
          </h2>
        </li>
      </ul>
    </section>
  </GenericContainer>
</template>

<style scoped>
a {
  position: relative;
}
a::after {
  content: '';
  position: absolute;
  top: 50%;
  left: calc(100% + 1rem);
  inline-size: 32px;
  block-size: 32px;
  translate: 0 -50%;
  background-image: url(../assets/right-arrow.svg);
  transition: translate 0.3s ease;
}
a:where(:hover, :focus)::after {
  translate: 6px -50%;
}
</style>

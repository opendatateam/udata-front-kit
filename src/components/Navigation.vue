<script setup>
const navItems = [
  {
    to: '/',
    text: 'Accueil'
  },
  {
    to: '/datasets',
    text: 'Jeux de données'
  },
  {
    to: '/organizations',
    text: 'Organisations'
  },
  {
    to: '/bouquets',
    text: 'Bouquets'
  },
  {
    to: '/about',
    text: 'À propos'
  }
]
</script>

<template>
  <DsfrNavigation :nav-items="navItems" />
</template>

<style scoped></style>

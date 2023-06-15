<script setup>
const navItems = [
  {
    "to": "/",
    "text": "Accueil",
  },
  {
    "to": "datasets",
    "text": "Jeux de données",
  },
  {
    "to": "organisations",
    "text": "Organisations",
  },
  {
    "to": "/about",
    "text": "À propos",
  }

]
</script>

<template>
  <DsfrNavigation :nav-items="navItems" />
</template>

<style scoped>
</style>

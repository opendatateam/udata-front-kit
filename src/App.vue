<script setup>
import { RouterLink, RouterView } from "vue-router"
import Navigation from "./components/Navigation.vue"
</script>

<template>
  <DsfrHeader
    service-title="Ecosphères"
    service-description="Guichet unique des données ministérielles"
    home-to="/"
    :quick-links="[]"
    :show-search="false"
    logo-text="MINISTÈRES<br>
      TRANSITION ÉCOLOGIQUE<br>
      COHÉSION DES TERRITOIRES<br>
      TRANSITION ÉNERGÉTIQUE<br>
      MER"
  />

  <div class="fr-header__body">
    <div class="fr-container  width-inherit">
      <Navigation />
      <RouterView />
    </div>
  </div>
</template>

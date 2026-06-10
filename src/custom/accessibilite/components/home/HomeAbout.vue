<script lang="ts" setup>
import { DsfrButton } from '@gouvminint/vue-dsfr'
</script>

<template>
  <section class="fr-pt-7w fr-pb-10w fr-background-alt--yellow-moutarde">
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col">
          <h2>À propos du Point d’accès unique aux données d’accessibilité</h2>
          <p>Des données ouvertes pour&nbsp;:</p>
          <ul>
            <li>évaluer rapidement l'accessibilité d'un territoire</li>
            <li>trouver des informations détaillées sur l'accessibilité</li>
            <li>innover au service des personnes en situation de handicap</li>
          </ul>
        </div>
        <div class="fr-col">
          <h2>Construisons ce portail thématique ensemble</h2>
          <p>
            Collectivités, associations, élu·es, entreprises, chargé·es de
            politiques publiques en faveur de l'accessibilité, citoyen·es, nous
            comptons sur vous pour enrichir ce portail avec des données
            d'accessibilité.
          </p>
          <p>
            Partagez-nous vos données d'accessibilité, faites-nous des retours
            d'expérience et exprimez vos besoins en matière de données
            d'accessibilité.
          </p>
          <DsfrButton
            label="Contactez-nous"
            icon="fr-icon-arrow-right-line"
            :icon-right="true"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { DsfrButton } from '@gouvminint/vue-dsfr'
import { useClipboard } from '@vueuse/core'

const emailAddress = ref('accessibilite@data.gouv.fr')
const { copy, copied, isSupported } = useClipboard({ copiedDuring: 3000 })

const alreadyCopied = ref(false)
const handleCopy = () => {
  copy(emailAddress.value)
  // avoid text flashing on button from synchronous 'setButtonText' computed
  setTimeout(() => {
    alreadyCopied.value = true
  }, 100)
}

const setButtonText = computed(() => {
  /** since the button's text changes, it needs to be announced with an aria-live region. To avoid repeating the same text when the button resets, we use a third text when the address has already been copied before.
   */
  let text = "Copier l'email"

  if (!copied.value && alreadyCopied.value) {
    text = "Copier de nouveau l'email"
  }
  if (copied.value) {
    text = 'Email copié !'
  }

  return text
})
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
          <h3>Contactez-nous sur&nbsp;:</h3>
          <p>
            <a
              class="fr-link"
              :href="`mailto:${emailAddress}?subject=Prise%20de%20contact%20-%20PAUDA`"
              >{{ emailAddress }}
              <span class="sr-only">(ouvre un logiciel de messagerie)</span></a
            >&nbsp;
            <DsfrButton
              v-if="isSupported"
              class="fr-my-1v"
              aria-live="polite"
              :label="setButtonText"
              size="sm"
              secondary
              :icon="copied ? 'fr-icon-check-line' : ''"
              icon-right
              @click="handleCopy"
            />
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

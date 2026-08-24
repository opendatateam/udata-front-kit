<script lang="ts" setup>
import { DsfrAlert, DsfrButton } from '@gouvminint/vue-dsfr'
import { useClipboard } from '@vueuse/core'

const emailAddress = ref('accessibilite@data.gouv.fr')
const { copy, isSupported } = useClipboard()

const copyAlert = useTemplateRef('copyAlert')
const copyButton = useTemplateRef('copyButton')

const alreadyCopied = ref(false)
const showAlert = ref(false)

const handleCopy = () => {
  copy(emailAddress.value)
  alreadyCopied.value = true
  showAlert.value = true
  setTimeout(() => {
    copyAlert.value?.$el.children[1].focus()
  }, 100)
}

const closeAlert = () => {
  showAlert.value = false
  copyButton.value?.focus()
}
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
            politiques publiques en faveur de l'accessibilité, citoyen·nes, nous
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
              ref="copyButton"
              class="fr-my-1v"
              label="Copier l'e-mail"
              size="sm"
              secondary
              @click="handleCopy"
            />
          </p>
          <DsfrAlert
            v-if="alreadyCopied && showAlert"
            ref="copyAlert"
            type="success"
            description="E-mail copié !"
            :closeable="true"
            title-tag="h3"
            small
            @close="closeAlert"
          />
        </div>
      </div>
    </div>
  </section>
</template>

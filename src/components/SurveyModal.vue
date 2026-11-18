<script setup lang="ts">
import { useMutationObserver, useTimeoutFn } from '@vueuse/core'

import LocalStorageService from '@/services/LocalStorageService'
import { useSurveyConf } from '@/utils/config'

const DEFAULT_DELAY_SECONDS = 180

const route = useRoute()
const conf = useSurveyConf()

// Keyed by survey id so a new survey shows again to users who dismissed a previous one.
const dismissedKey = `survey_dismissed_${conf?.id}`

// Without storage the "Ne plus afficher" choice can't be kept, so never show the modal.
const enabled =
  !!conf?.display &&
  !!conf.id &&
  !!conf.url &&
  LocalStorageService.isAvailable() &&
  !LocalStorageService.getItem(dismissedKey)

const due = ref(false)
const opened = ref(false)
const dontShowAgain = ref(false)

// Timer starts on page load and survives in-app navigation; nothing is stored until the user opts out.
if (enabled) {
  useTimeoutFn(
    () => (due.value = true),
    (conf.delay ?? DEFAULT_DELAY_SECONDS) * 1000
  )
}

// DsfrModal sets `modal-open` on body while any modal is shown.
const otherModalOpen = ref(false)
useMutationObserver(
  document.body,
  () => (otherModalOpen.value = document.body.classList.contains('modal-open')),
  { attributes: true, attributeFilter: ['class'] }
)

// Wait for a regular page with no other modal or form (admin routes) in progress.
watchEffect(() => {
  if (
    !due.value ||
    opened.value ||
    otherModalOpen.value ||
    route.meta.fullscreen ||
    route.meta.requiresAuth
  ) {
    return
  }
  due.value = false
  // Re-check in case it was dismissed from another tab meanwhile.
  if (LocalStorageService.getItem(dismissedKey)) return
  opened.value = true
})

const close = () => {
  opened.value = false
  if (dontShowAgain.value) {
    LocalStorageService.setItem(dismissedKey, new Date().toISOString())
  }
}
</script>

<template>
  <Teleport v-if="conf && opened" to="body">
    <DsfrModal
      modal-id="survey-modal"
      :opened="opened"
      :title="conf.title"
      size="md"
      class="survey-modal"
      @close="close"
    >
      <p>{{ conf.content }}</p>
      <div class="fr-checkbox-group fr-checkbox-group--sm">
        <input
          id="survey-dont-show-again"
          v-model="dontShowAgain"
          type="checkbox"
          name="survey-dont-show-again"
        />
        <label class="fr-label" for="survey-dont-show-again">
          Ne plus afficher ce message
          <span id="survey-dont-show-again-hint" class="fr-hint-text">
            Votre choix sera conservé dans votre navigateur.
          </span>
        </label>
      </div>
      <template #footer>
        <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
          <li>
            <DsfrButton secondary label="Non merci" @click="close" />
          </li>
          <li>
            <a
              class="fr-btn"
              :href="conf.url"
              target="_blank"
              rel="noopener"
              :title="`${conf.button_label} - nouvelle fenêtre`"
              @click="close"
            >
              {{ conf.button_label }}
            </a>
          </li>
        </ul>
      </template>
    </DsfrModal>
  </Teleport>
</template>

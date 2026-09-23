<script setup lang="ts">
import { computed } from 'vue'

import { useAlbertChatStore } from '@/store/AlbertChatStore'
import { fromMarkdown } from '@/utils'

// Shared by ConfigEditorView.vue (standalone, default prompt) and
// BootstrapWizardView.vue's config step (dedicated universe-aware prompt,
// via albertChat.reset({ systemPrompt }) — see AlbertChatStore.ts). This
// component itself has no opinion on which prompt is active — it just
// renders whatever's currently in the store.
const albertChat = useAlbertChatStore()

const props = withDefaults(
  defineProps<{
    // The wizard's config step doesn't need any user-typed input to start:
    // its dedicated system prompt already carries the full universe
    // context (see BootstrapWizardView.vue's buildWizardPrompt()). When
    // true and nothing has been sent yet, the send button calls
    // albertChat.start() (no user turn) instead of requiring text first.
    allowStartWithoutInput?: boolean
  }>(),
  { allowStartWithoutInput: false }
)

const canStart = computed(
  () =>
    props.allowStartWithoutInput &&
    albertChat.chatLog.length === 0 &&
    !albertChat.userInput.trim()
)

const hasAppliedConfig = computed(() =>
  albertChat.chatLog.some((entry) => entry.role === 'config')
)
</script>

<template>
  <section class="albert-generator fr-p-3w fr-mb-3w">
    <h2 class="fr-h6">Générer avec Albert</h2>
    <p class="fr-text--sm fr-mb-2w">
      Votre jeton reste stocké seulement dans ce navigateur. Il transite, pour
      chaque appel, par une fonction relais sans état hébergée avec ce site
      (l'API Albert refuse les appels directs depuis un navigateur) — cette
      fonction ne conserve ni ne journalise le jeton.
    </p>

    <div class="fr-input-group">
      <DsfrInput
        id="albert-token"
        :model-value="albertChat.token"
        type="password"
        label="Jeton API Albert"
        label-visible
        @update:model-value="albertChat.setToken($event as string)"
      />
    </div>

    <details class="fr-mb-2w">
      <summary>Voir / modifier le prompt utilisé</summary>
      <textarea
        class="albert-prompt-preview"
        rows="6"
        spellcheck="false"
        :value="albertChat.systemPrompt"
        @change="
          albertChat.setSystemPrompt(
            ($event.target as HTMLTextAreaElement).value
          )
        "
      />
      <button
        type="button"
        class="fr-btn fr-btn--tertiary fr-btn--sm fr-mt-1w"
        @click="albertChat.resetSystemPrompt"
      >
        Réinitialiser le prompt par défaut
      </button>
    </details>

    <div v-if="albertChat.chatLog.length" class="albert-chat-log fr-mb-2w">
      <div
        v-for="(entry, i) in albertChat.chatLog"
        :key="i"
        class="albert-chat-entry"
        :class="`albert-chat-entry--${entry.role}`"
      >
        <strong v-if="entry.role === 'question'">Albert demande : </strong>
        <strong v-else-if="entry.role === 'error'">Erreur : </strong>
        <!-- Albert's own text (everything but the user's own typed
        messages) can contain markdown — confirmed live, its summaries use
        bold/numbered lists. fromMarkdown() already sanitizes via
        DOMPurify. -->
        <span v-if="entry.role === 'user'" class="albert-chat-entry-text">{{
          entry.text
        }}</span>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span
          v-else
          class="albert-chat-entry-text"
          v-html="fromMarkdown(entry.text).html"
        />
      </div>
      <div
        v-if="albertChat.loading"
        class="albert-chat-entry albert-chat-entry--info"
      >
        Albert réfléchit…
      </div>
    </div>

    <DsfrAlert
      v-if="albertChat.error"
      type="error"
      :title="albertChat.error"
      class="fr-mb-2w"
    />

    <div class="fr-input-group">
      <DsfrInput
        id="albert-user-input"
        v-model="albertChat.userInput"
        is-textarea
        :label="
          albertChat.pendingToolCallId
            ? 'Votre réponse'
            : albertChat.chatLog.length
              ? 'Affiner (ex : plus de vert, un autre titre…)'
              : allowStartWithoutInput
                ? 'Instructions supplémentaires (facultatif)'
                : 'Décrivez les modifications que vous souhaitez apporter'
        "
        label-visible
        :placeholder="
          allowStartWithoutInput && !albertChat.chatLog.length
            ? 'Facultatif : précisez si besoin avant de lancer la génération'
            : 'Ex : enlève le bandeau, change la couleur principale en bleu'
        "
        @keydown.enter.exact.prevent="albertChat.send"
      />
    </div>

    <div class="fr-btns-group fr-btns-group--inline fr-btns-group--right">
      <RouterLink
        v-if="hasAppliedConfig"
        class="fr-btn fr-btn--secondary"
        to="/"
      >
        Voir mon site
      </RouterLink>
      <button
        v-if="albertChat.chatLog.length"
        type="button"
        class="fr-btn fr-btn--secondary"
        @click="albertChat.reset()"
      >
        Nouvelle conversation
      </button>
      <button
        type="button"
        class="fr-btn"
        :disabled="albertChat.loading"
        @click="canStart ? albertChat.start() : albertChat.send()"
      >
        {{
          albertChat.loading
            ? 'Envoi…'
            : canStart
              ? 'Lancer la génération'
              : 'Envoyer'
        }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.albert-generator {
  background-color: var(--background-alt-blue-france, #f5f5fe);
  border: 1px solid var(--border-default-grey, #ddd);
}
.albert-prompt-preview {
  width: 100%;
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-size: 0.8rem;
  background-color: var(--background-default-grey, #fff);
  border: 1px solid var(--border-default-grey, #ddd);
  padding: 1rem;
}
.albert-chat-log {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.albert-chat-entry {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  background-color: var(--background-default-grey, #fff);
  border: 1px solid var(--border-default-grey, #ddd);
}
.albert-chat-entry--user {
  align-self: flex-end;
  background-color: var(--background-action-low-blue-france, #e8edff);
}
.albert-chat-entry--config {
  border-color: var(--border-plain-success, #18753c);
}
.albert-chat-entry--error {
  border-color: var(--border-plain-error, #ce0500);
}
.albert-chat-entry-text :deep(p) {
  margin: 0 0 0.5em;
}
.albert-chat-entry-text :deep(p:last-child) {
  margin-bottom: 0;
}
.albert-chat-entry-text :deep(ul),
.albert-chat-entry-text :deep(ol) {
  margin: 0.25em 0 0.5em 1.25em;
  padding: 0;
}
summary {
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>

<script setup lang="ts">
import { dump, load } from 'js-yaml'

import config, { configStorageKey } from '@/config'
import LocalStorageService from '@/services/LocalStorageService'
import { useAlbertChatStore } from '@/store/AlbertChatStore'
import { mergeConfigAndPersist } from '@/utils/configMerge'

// The Albert conversation lives in a Pinia store, not local refs here —
// found live that navigating away from /editor (e.g. to check the result
// on the homepage) and back destroyed the whole conversation, since a
// component's local <script setup> state doesn't survive unmount. Every
// other cross-page-persistent thing in this app (UserStore, etc.) already
// uses this same pattern.
const albertChat = useAlbertChatStore()

const yamlText = ref(dump(toRaw(config), { lineWidth: -1 }))
const parseError = ref<string | null>(null)
const hasLocalConfig = ref(
  LocalStorageService.getItem(configStorageKey) != null
)

const applyYaml = () => {
  let parsed: unknown
  try {
    parsed = load(yamlText.value)
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : String(e)
    return
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    parseError.value =
      'Le document YAML doit être un objet (ex: site_id: ..., website: ...).'
    return
  }
  parseError.value = null
  mergeConfigAndPersist(parsed as Record<string, unknown>)
  hasLocalConfig.value = true
}

// AlbertChatStore.send() applies config updates itself (see
// store/AlbertChatStore.ts); refresh the textarea preview whenever that
// happens so "mode avancé" shows the latest state. Deliberately does NOT
// touch yamlText.value from applyYaml/manual edits — see that function —
// this only reacts to the Albert-driven path.
watch(
  () => albertChat.chatLog.length,
  () => {
    if (albertChat.chatLog.at(-1)?.role === 'config') {
      yamlText.value = dump(toRaw(config), { lineWidth: -1 })
      hasLocalConfig.value = true
    }
  }
)

// The reactive `config` singleton is only re-seeded from localStorage at
// module load (see @/config.ts's initialConfig()) — clearing storage alone
// wouldn't reset the live in-memory config, so a reload is needed too.
const deleteLocalConfig = () => {
  LocalStorageService.removeItem(configStorageKey)
  window.location.reload()
}

const downloadConfig = () => {
  const yaml = dump(toRaw(config), { lineWidth: -1 })
  const blob = new Blob([yaml], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `config-${config.site_id}.yaml`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="fr-container fr-my-4w">
    <h1>Éditeur de configuration</h1>

    <div
      v-if="hasLocalConfig"
      class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mb-3w"
    >
      <button
        type="button"
        class="fr-btn fr-background-action-high--red-marianne"
        @click="deleteLocalConfig"
      >
        Supprimer la configuration locale
      </button>
    </div>

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
        <summary>Voir le prompt utilisé</summary>
        <pre class="albert-prompt-preview">{{ albertChat.systemPrompt }}</pre>
      </details>

      <div v-if="albertChat.chatLog.length" class="albert-chat-log fr-mb-2w">
        <div
          v-for="(entry, i) in albertChat.chatLog"
          :key="i"
          class="albert-chat-entry"
          :class="`albert-chat-entry--${entry.role}`"
        >
          <strong v-if="entry.role === 'question'">Albert demande : </strong>
          <strong v-else-if="entry.role === 'config'">✓ </strong>
          <strong v-else-if="entry.role === 'error'">Erreur : </strong>
          {{ entry.text }}
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
                ? 'Affiner (ex : plus de vert, un autre tag…)'
                : 'Décrivez le site que vous voulez créer'
          "
          label-visible
          placeholder="Ex : un site sur les données du vélo en libre-service en France"
          @keydown.enter.exact.prevent="albertChat.send"
        />
      </div>

      <div class="fr-btns-group fr-btns-group--inline fr-btns-group--right">
        <button
          v-if="albertChat.chatLog.length"
          type="button"
          class="fr-btn fr-btn--secondary"
          @click="albertChat.reset"
        >
          Nouvelle conversation
        </button>
        <button
          type="button"
          class="fr-btn"
          :disabled="albertChat.loading"
          @click="albertChat.send"
        >
          {{ albertChat.loading ? 'Envoi…' : 'Envoyer' }}
        </button>
      </div>
    </section>

    <details>
      <summary>Mode avancé : éditer le fichier de configuration</summary>

      <p class="fr-text--sm">
        Ce texte est le contenu de <code>config.yaml</code>. « Sauvegarder » met
        à jour le site en direct et conserve cette configuration dans ce
        navigateur (elle sera reproposée à la prochaine visite). Rien n'est
        encore écrit dans le vrai <code>config.yaml</code> du dépôt — utilisez
        le téléchargement pour ça.
      </p>

      <DsfrAlert
        v-if="parseError"
        type="error"
        :title="'YAML invalide, non appliqué : ' + parseError"
        class="fr-mb-2w"
      />

      <textarea
        v-model="yamlText"
        class="config-editor-textarea"
        spellcheck="false"
        rows="35"
        aria-label="Contenu YAML de la configuration du site"
      />

      <div
        class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-2w"
      >
        <button
          type="button"
          class="fr-btn fr-btn--secondary"
          @click="downloadConfig"
        >
          Télécharger la config (YAML)
        </button>
        <button type="button" class="fr-btn" @click="applyYaml">
          Sauvegarder
        </button>
      </div>
    </details>
  </div>
</template>

<style scoped>
.albert-generator {
  background-color: var(--background-alt-blue-france, #f5f5fe);
  border: 1px solid var(--border-default-grey, #ddd);
}
.albert-prompt-preview {
  white-space: pre-wrap;
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
  max-height: 20rem;
  overflow-y: auto;
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
summary {
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 1rem;
}
.config-editor-textarea {
  width: 100%;
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  padding: 1rem;
  border: 1px solid var(--border-default-grey, #ddd);
  tab-size: 2;
}
</style>

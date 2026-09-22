<script setup lang="ts">
import { dump, load } from 'js-yaml'

import config from '@/config'

// config is a reactive singleton (see @/config.ts): mutating it in place
// updates the same object every other component reads through computed(),
// so HeaderComponent/App/HomeView hot-update as you edit, with no separate
// preview implementation to keep in sync.
//
// Crucially, "in place" has to hold all the way down the tree: some
// consumers (HeaderComponent, App.vue) capture config.website once at setup
// via useWebsiteConfig() rather than through a computed(). If we ever
// replaced config.website itself with a new object (e.g. a naive
// delete-everything-then-Object.assign), those consumers would keep
// pointing at the old, orphaned object and stop updating forever. So the
// merge below only ever replaces leaf values — every nested object keeps
// its original identity.
const deepAssignInPlace = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
) => {
  for (const key of Object.keys(target)) {
    if (!(key in source)) delete target[key]
  }
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]
    const bothPlainObjects =
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    if (bothPlainObjects) {
      deepAssignInPlace(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      )
    } else {
      target[key] = sourceValue
    }
  }
}

const yamlText = ref(dump(toRaw(config), { lineWidth: -1 }))
const parseError = ref<string | null>(null)

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
  deepAssignInPlace(
    config as unknown as Record<string, unknown>,
    parsed as Record<string, unknown>
  )
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
    <p class="fr-text--sm">
      Ce texte est le contenu de <code>config.yaml</code>. Cliquez sur «
      Appliquer » pour mettre à jour le site en direct, tant que vous restez
      dans cet onglet. Rien n'est encore enregistré sur disque — utilisez le
      téléchargement une fois satisfait.
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
  </div>
</template>

<style scoped>
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

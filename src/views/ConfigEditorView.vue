<script setup lang="ts">
import { dump, load } from 'js-yaml'

import config, { configStorageKey } from '@/config'
import LocalStorageService from '@/services/LocalStorageService'

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
//
// `prune`: when true (the manual YAML-textarea path), a target key absent
// from source is deleted — correct there, since the textarea always holds
// the *complete* config. When false (the Albert path), absent keys are
// left untouched instead: Albert is only ever asked for a small subset of
// fields (see ALBERT_SYSTEM_PROMPT), so "absent" means "not part of this
// generation," not "delete this." Pruning there wiped out config.website.header
// (and everything else outside that subset) on every generation.
const deepAssignInPlace = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  { prune = true }: { prune?: boolean } = {}
) => {
  if (prune) {
    for (const key of Object.keys(target)) {
      if (!(key in source)) delete target[key]
    }
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
        sourceValue as Record<string, unknown>,
        { prune }
      )
    } else {
      target[key] = sourceValue
    }
  }
}

const yamlText = ref(dump(toRaw(config), { lineWidth: -1 }))
const parseError = ref<string | null>(null)

const mergeAndPersist = (
  parsed: Record<string, unknown>,
  options: { prune?: boolean } = {}
) => {
  deepAssignInPlace(
    config as unknown as Record<string, unknown>,
    parsed,
    options
  )
  LocalStorageService.setItem(configStorageKey, toRaw(config))
}

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
  mergeAndPersist(parsed as Record<string, unknown>)
}

// --- Albert API generation ---------------------------------------------
// The token is entered by the user and stored only in their own browser
// (localStorage) — we never see it. Calls go through our own same-origin
// /api/albert-* proxy (see api/albert-models.ts, api/albert-chat-completions.ts)
// rather than straight to albert.api.etalab.gouv.fr: Albert's API blocks
// direct browser calls (CORS), confirmed live — even Etalab's own web
// client goes through its own backend, not the browser, to reach it. The
// proxy is a stateless per-request relay: it forwards whatever
// Authorization header it receives and never stores or logs the token.
const ALBERT_TOKEN_KEY = 'albert-api-token'

const albertToken = ref(LocalStorageService.getItem(ALBERT_TOKEN_KEY) ?? '')
watch(albertToken, (value) => {
  LocalStorageService.setItem(ALBERT_TOKEN_KEY, value)
})

const albertPrompt = ref('')
const albertLoading = ref(false)
const albertError = ref<string | null>(null)

// Albert doesn't reliably honor "no markdown" instructions, so defensively
// unwrap a ```json ... ``` fence if the model wrapped its answer in one.
const stripCodeFence = (text: string): string => {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return match ? match[1].trim() : text.trim()
}

const ALBERT_SYSTEM_PROMPT = `Tu génères un fragment de configuration JSON pour un site data.gouv.fr, à partir de la description d'un thème donnée par l'utilisateur.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, respectant EXACTEMENT cette forme :
{
  "website": {
    "title": "string, nom du site, ex: Données Vélo",
    "homepage": {
      "title": "string, titre accrocheur pour la page d'accueil",
      "subtitle": "string, 1-2 phrases décrivant le site"
    },
    "footer": {
      "phrase": "string, 1 phrase décrivant le site pour le pied de page"
    },
    "home_banner_colors": ["#rrggbb", "#rrggbb", "#rrggbb"]
  },
  "pages": {
    "datasets": {
      "universe_query": {
        "tag": "string, un tag data.gouv.fr en kebab-case pertinent pour ce thème, ex: velo, energie, sante"
      }
    }
  }
}
Les couleurs doivent être une palette pastel harmonieuse en dégradé. Le tag doit être court, en minuscules, sans accents.`

const generateWithAlbert = async () => {
  albertError.value = null
  if (!albertToken.value.trim()) {
    albertError.value = 'Renseignez votre jeton Albert API.'
    return
  }
  if (!albertPrompt.value.trim()) {
    albertError.value = 'Décrivez le site que vous voulez créer.'
    return
  }
  albertLoading.value = true
  try {
    const headers = {
      Authorization: `Bearer ${albertToken.value.trim()}`,
      'Content-Type': 'application/json'
    }

    const modelsResponse = await fetch('/api/albert-models', {
      headers
    })
    if (!modelsResponse.ok) {
      throw new Error(
        `Impossible de lister les modèles (HTTP ${modelsResponse.status}). Jeton invalide ?`
      )
    }
    const modelsData = await modelsResponse.json()
    const modelId = modelsData?.data?.[0]?.id
    if (!modelId) {
      throw new Error('Aucun modèle disponible pour ce jeton.')
    }

    const completionResponse = await fetch('/api/albert-chat-completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: ALBERT_SYSTEM_PROMPT },
          { role: 'user', content: albertPrompt.value.trim() }
        ]
      })
    })
    if (!completionResponse.ok) {
      throw new Error(
        `Échec de la génération (HTTP ${completionResponse.status}).`
      )
    }
    const completionData = await completionResponse.json()
    console.log('[Albert] raw response:', completionData)
    const content = completionData?.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      throw new Error('Réponse Albert inattendue (pas de contenu texte).')
    }
    console.log('[Albert] message content:', content)

    const parsed: unknown = JSON.parse(stripCodeFence(content))
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      throw new Error("La réponse d'Albert n'est pas un objet JSON valide.")
    }
    console.log('[Albert] parsed fragment (merged without pruning):', parsed)

    // prune: false — Albert only ever returns a small subset of fields by
    // design (see ALBERT_SYSTEM_PROMPT); anything it doesn't mention must
    // be left alone, not deleted.
    mergeAndPersist(parsed as Record<string, unknown>, { prune: false })
    yamlText.value = dump(toRaw(config), { lineWidth: -1 })
  } catch (e) {
    albertError.value =
      e instanceof Error ? e.message : 'Erreur inconnue lors de la génération.'
    // calls go through our own same-origin /api/albert-* proxy now, so a
    // network-level failure here means the proxy itself is unreachable —
    // e.g. running via `pnpm run dev` (Vite alone doesn't serve /api/*,
    // only `vercel dev` or an actual Vercel deployment does), not CORS.
    if (e instanceof TypeError) {
      albertError.value +=
        " (échec réseau vers /api/albert-* — en local, cette route n'existe que sous `vercel dev`, pas sous `pnpm run dev`.)"
    }
  } finally {
    albertLoading.value = false
  }
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
          v-model="albertToken"
          type="password"
          label="Jeton API Albert"
          label-visible
        />
      </div>

      <div class="fr-input-group">
        <DsfrInput
          id="albert-prompt"
          v-model="albertPrompt"
          is-textarea
          label="Décrivez le site que vous voulez créer"
          label-visible
          placeholder="Ex : un site sur les données du vélo en libre-service en France"
        />
      </div>

      <details class="fr-mb-2w">
        <summary>Voir le prompt utilisé</summary>
        <pre class="albert-prompt-preview">{{ ALBERT_SYSTEM_PROMPT }}</pre>
      </details>

      <DsfrAlert
        v-if="albertError"
        type="error"
        :title="albertError"
        class="fr-mb-2w"
      />

      <button
        type="button"
        class="fr-btn"
        :disabled="albertLoading"
        @click="generateWithAlbert"
      >
        {{ albertLoading ? 'Génération en cours…' : 'Générer' }}
      </button>
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

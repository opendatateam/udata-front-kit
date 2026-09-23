import { dump } from 'js-yaml'
import { defineStore } from 'pinia'
import { toRaw } from 'vue'

import config from '@/config'
import LocalStorageService from '@/services/LocalStorageService'
import { mergeConfigAndPersist } from '@/utils/configMerge'

// State lives in a Pinia store (survives navigation, unlike a component's
// local <script setup> refs, which are destroyed on unmount) rather than
// in ConfigEditorView.vue directly: found live that navigating away from
// /editor to check the result and back wiped the whole conversation —
// confirmed via a live test (2 chat entries -> 0 after nav away and back).
// Every other cross-page-persistent thing in this app (UserStore, etc.)
// already uses this same pattern.

// Model is pinned rather than picked from GET /v1/models: validated live
// (real token, real requests) that qwen3-coder-30b-a3b-instruct reliably
// calls the right tool with well-formed arguments across multiple turns —
// clarifying question, initial proposal, and a follow-up refinement.
// GET /v1/models exposes no "supports tool calling well" field, only a
// coarse type/context-length, so an auto-picked model has no such
// guarantee.
const ALBERT_MODEL = 'qwen3-coder-30b-a3b-instruct'
const ALBERT_TOKEN_KEY = 'albert-api-token'
const ALBERT_PROMPT_KEY = 'albert-system-prompt'

// Default — editable from the UI (see ConfigEditorView.vue) and persisted
// separately per browser, same pattern as the token.
const DEFAULT_ALBERT_SYSTEM_PROMPT = `Tu aides à configurer un site data.gouv.fr thématique par une conversation en français, naturelle et concise.
L'univers de données du site — c'est-à-dire quels jeux de données il expose — est défini séparément, via un Topic data.gouv.fr, dans l'éditeur d'univers : tu ne le modifies jamais et ne proposes jamais de tag pour le redéfinir. En revanche, les filtres de recherche proposés sur la page des jeux de données (organisation, format, licence, etc.) font partie de la présentation de cette page, pas de la définition de l'univers : tu peux et dois les proposer normalement.
Utilise l'outil ask_question si tu manques d'éléments pour faire une proposition cohérente — une seule question à la fois.

Ce que tu peux proposer ou ajuster via propose_config : le titre du portail, son URL (sous la forme "{thématique}.data.gouv.fr"), sa description, la page d'accueil (titre et sous-titre), la phrase de pied de page, la palette de couleurs de la bannière, les filtres de recherche de la page des jeux de données (organisation, format, licence, etc.), et l'affichage du bandeau "site de démarrage généré automatiquement" (à désactiver dès que le site a un vrai thème).

propose_config est un patch partiel : les champs que tu n'envoies pas gardent leur valeur actuelle. Le site est déjà configuré, tu interviens sur une configuration existante.
Quand l'utilisateur demande un ajustement précis (ex : "enlève le bandeau", "change la couleur principale", "ajoute un filtre par organisation"), n'envoie QUE le ou les champs concernés — ne renvoie jamais le titre, la page d'accueil, le pied de page ou les couleurs si on ne t'a pas demandé de les changer : tu écraserais le travail déjà fait avec des valeurs réinventées.
N'envoie une configuration complète que si l'utilisateur demande explicitement de (re)configurer entièrement le site.

Dès que tu as assez d'éléments pour une proposition ou un ajustement, même imparfait, résume-le d'abord en texte libre et demande à l'utilisateur de le valider ou d'indiquer des ajustements — n'appelle pas encore propose_config à ce stade.
N'appelle l'outil propose_config qu'une fois que l'utilisateur a validé cette proposition (ou demandé des ajustements que tu as intégrés dans un nouveau résumé texte, validé à son tour). Ton modèle ne peut pas produire à la fois un texte et un appel d'outil dans le même message : résume toujours d'abord, appelle l'outil seulement ensuite, jamais les deux en même temps.
Les couleurs doivent être une palette pastel harmonieuse en dégradé.`

// Validated live against the real API: both models tried returned correct
// tool_calls with arguments matching this schema exactly, no markdown
// fence to strip.
//
// No `universe_query`/tag property here at all, in either flow: the
// universe (which datasets the site exposes) is exclusively managed via a
// data.gouv.fr Topic through the universe editor (see UniverseStore.ts) —
// Albert never touches dataset scoping, only presentation. `pages` is only
// used for `filters` (search facets on top of the universe), and stays
// optional — a page with zero filters is valid.
//
// `filters` is restricted to built-in facet types that don't need an
// explicit `values` enum (unlike the "select"/custom-values filters seen in
// hand-written configs) — the framework populates their options from real
// search facets, so a blind LLM proposal can't produce a broken/empty list.
const FILTER_TYPES = [
  'organization_custom',
  'format_family',
  'license',
  'producer_type',
  'temporal_coverage'
] as const

function buildAlbertTools() {
  return [
    {
      type: 'function',
      function: {
        name: 'ask_question',
        description:
          "Pose une question de clarification à l'utilisateur avant de proposer une configuration, si le thème du site n'est pas assez précis.",
        parameters: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description:
                'La question à poser, en français, une seule à la fois.'
            }
          },
          required: ['question'],
          additionalProperties: false
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'propose_config',
        description:
          "Applique une modification à la configuration du site data.gouv.fr. C'est un patch partiel : n'inclus que les champs à créer ou modifier, tout champ absent garde sa valeur actuelle. Pour un simple ajustement (une couleur, le bandeau, un filtre…), n'envoie que le champ concerné ; n'envoie une configuration complète que s'il s'agit vraiment de configurer le site de zéro.",
        parameters: {
          type: 'object',
          properties: {
            website: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                homepage: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    subtitle: { type: 'string' }
                  },
                  // No required fields: changing only the subtitle must not
                  // force Albert to restate (and often reinvent) the title.
                  required: [],
                  additionalProperties: false
                },
                footer: {
                  type: 'object',
                  properties: { phrase: { type: 'string' } },
                  required: ['phrase'],
                  additionalProperties: false
                },
                home_banner_colors: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 3,
                  maxItems: 3
                },
                seo: {
                  type: 'object',
                  properties: {
                    canonical_url: {
                      type: 'string',
                      description:
                        'URL du portail, sous la forme "{thématique}.data.gouv.fr" (sans https://).'
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        description: {
                          type: 'string',
                          description: 'Description courte du portail.'
                        }
                      },
                      required: ['description'],
                      additionalProperties: false
                    }
                  },
                  additionalProperties: false
                },
                notice: {
                  type: 'object',
                  properties: {
                    display: {
                      type: 'boolean',
                      description:
                        'false pour masquer le bandeau "site de démarrage généré automatiquement".'
                    }
                  },
                  required: ['display'],
                  additionalProperties: false
                }
              },
              // Everything optional, deliberately: this tool is a partial
              // patch (mergeConfigAndPersist with prune:false leaves absent
              // keys alone), so requiring these made atomic edits literally
              // impossible to express — "enlève le bandeau" had to carry a
              // title/homepage/footer/colors payload too, which is why
              // Albert rewrote the whole config for every small ask.
              required: [],
              // Critical: without this, nothing stops Albert from adding an
              // unrequested key like "header" — which isn't in this schema
              // at all — and deepAssignInPlace's prune:false merge will
              // then clobber config.website.header wholesale if that value
              // isn't itself a plain object, crashing every computed() in
              // App.vue/HeaderComponent.vue that reads it unconditionally.
              // Confirmed live: exactly this happened mid-conversation.
              additionalProperties: false
            },
            pages: {
              type: 'object',
              properties: {
                datasets: {
                  type: 'object',
                  properties: {
                    filters: {
                      type: 'array',
                      description:
                        "Filtres de recherche à proposer sur la page des jeux de données (organisation, format, licence, etc.), pertinents pour les données déjà présentes dans l'univers. Peut être un tableau vide.",
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            description:
                              'Identifiant court et unique du filtre, ex: "organization".'
                          },
                          name: {
                            type: 'string',
                            description: 'Libellé affiché, ex: "Organisation".'
                          },
                          type: { type: 'string', enum: [...FILTER_TYPES] },
                          default_option: {
                            type: 'string',
                            description:
                              'Texte affiché par défaut, ex: "Toutes les organisations".'
                          }
                        },
                        required: ['id', 'name', 'type'],
                        additionalProperties: false
                      }
                    }
                  },
                  required: [],
                  additionalProperties: false
                }
              },
              required: ['datasets'],
              additionalProperties: false
            }
          },
          // Also optional: a filters-only change (e.g. "ajoute un filtre par
          // organisation") has no business carrying a `website` payload.
          required: [],
          additionalProperties: false
        }
      }
    }
  ]
}

export type AlbertToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}
export type AlbertMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: AlbertToolCall[]
  tool_call_id?: string
}
export type ChatEntry = {
  role: 'user' | 'question' | 'config' | 'info' | 'error'
  text: string
}

export interface AlbertChatState {
  token: string
  systemPrompt: string
  userInput: string
  messages: AlbertMessage[]
  chatLog: ChatEntry[]
  pendingToolCallId: string | null
  loading: boolean
  error: string | null
}

const persistedDefaultPrompt = () =>
  LocalStorageService.getItem(ALBERT_PROMPT_KEY) ?? DEFAULT_ALBERT_SYSTEM_PROMPT

const initialMessages = (systemPrompt: string): AlbertMessage[] => [
  { role: 'system', content: systemPrompt }
]

export const useAlbertChatStore = defineStore('albertChat', {
  state: (): AlbertChatState => {
    const systemPrompt = persistedDefaultPrompt()
    return {
      token: LocalStorageService.getItem(ALBERT_TOKEN_KEY) ?? '',
      systemPrompt,
      userInput: '',
      messages: initialMessages(systemPrompt),
      chatLog: [],
      pendingToolCallId: null,
      loading: false,
      error: null
    }
  },
  actions: {
    setToken(value: string) {
      this.token = value
      LocalStorageService.setItem(ALBERT_TOKEN_KEY, value)
    },
    setSystemPrompt(value: string) {
      this.systemPrompt = value
      LocalStorageService.setItem(ALBERT_PROMPT_KEY, value)
      // keep an already-started conversation in sync without forcing
      // "Nouvelle conversation" — only the system message is touched
      if (this.messages[0]?.role === 'system') {
        this.messages[0].content = value
      }
    },
    resetSystemPrompt() {
      this.setSystemPrompt(DEFAULT_ALBERT_SYSTEM_PROMPT)
    },
    // `options` lets a caller (e.g. BootstrapWizardView.vue's config step)
    // start a fresh conversation with a one-off, dedicated prompt without
    // touching the persisted default (see setSystemPrompt) — a plain
    // reset() with no options behaves exactly as before, reverting to the
    // persisted default prompt.
    reset(options: { systemPrompt?: string } = {}) {
      this.systemPrompt = options.systemPrompt ?? persistedDefaultPrompt()
      this.messages = initialMessages(this.systemPrompt)
      this.chatLog = []
      this.pendingToolCallId = null
      this.error = null
    },
    async send() {
      const text = this.userInput.trim()
      if (!text) return
      if (!this.token.trim()) {
        this.error = 'Renseignez votre jeton Albert API.'
        return
      }
      this.error = null

      if (this.pendingToolCallId) {
        this.messages.push({
          role: 'tool',
          tool_call_id: this.pendingToolCallId,
          content: text
        })
        this.pendingToolCallId = null
      } else {
        this.messages.push({ role: 'user', content: text })
      }
      this.chatLog.push({ role: 'user', text })
      this.userInput = ''
      await this.requestCompletion()
    },
    // Kicks off a conversation with no user turn at all — used by
    // BootstrapWizardView.vue's config step, whose dedicated system prompt
    // (see buildWizardPrompt()) already carries the full universe context,
    // so there's nothing useful for the user to type before Albert can
    // start proposing. A plain OpenAI-style chat completion works fine
    // with just a system message, no user message required.
    async start() {
      if (!this.token.trim()) {
        this.error = 'Renseignez votre jeton Albert API.'
        return
      }
      if (this.chatLog.length > 0) return
      this.error = null
      await this.requestCompletion()
    },
    async requestCompletion() {
      this.loading = true

      const tools = buildAlbertTools()

      console.log('[Albert] system prompt used:', this.systemPrompt)
      console.log('[Albert] full messages sent:', this.messages)
      // The model sees these tool descriptions on every request regardless
      // of the system prompt — e.g. propose_config's description literally
      // says "Propose une configuration de site data.gouv.fr...", which is
      // why the model still references "une configuration" even under an
      // unrelated/joke system prompt.
      console.log('[Albert] tools sent:', tools)

      try {
        const response = await fetch('/api/albert-chat-completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: ALBERT_MODEL,
            messages: this.messages,
            tools,
            tool_choice: 'auto'
          })
        })
        if (!response.ok) {
          throw new Error(`Échec de la génération (HTTP ${response.status}).`)
        }
        const data = await response.json()
        console.log('[Albert] raw response:', data)
        const message = data?.choices?.[0]?.message
        if (!message) {
          throw new Error('Réponse Albert inattendue (pas de message).')
        }
        this.messages.push(message)

        const toolCall: AlbertToolCall | undefined = message.tool_calls?.[0]
        if (!toolCall) {
          // tool_choice is 'auto', not 'required' — a plain-text reply is
          // possible. Show it and just wait for a normal follow-up.
          this.chatLog.push({
            role: 'info',
            text: message.content ?? '(réponse vide)'
          })
          return
        }

        let args: Record<string, unknown>
        try {
          args = JSON.parse(toolCall.function.arguments)
        } catch (parseErr) {
          // keep the tool-call protocol well-formed even on failure, so
          // the next turn isn't left with a dangling unanswered tool_call
          this.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: 'Erreur : arguments invalides (JSON non parsable).'
          })
          throw parseErr instanceof Error
            ? parseErr
            : new Error("Arguments d'outil invalides.")
        }

        if (toolCall.function.name === 'ask_question') {
          const question = String(args.question ?? '')
          this.chatLog.push({ role: 'question', text: question })
          this.pendingToolCallId = toolCall.id
        } else if (toolCall.function.name === 'propose_config') {
          // prune: false — Albert only ever returns this small subset of
          // fields by design; anything it doesn't mention must be left
          // alone, not deleted.
          mergeConfigAndPersist(args, { prune: false })
          // Summarizing the proposal is Albert's job, not ours to
          // reconstruct field-by-field from `args` — the system prompt
          // asks it to accompany the tool call with a short recap as the
          // message content. Fall back to a minimal line only if it left
          // content empty (some backends null it out alongside a tool
          // call).
          this.chatLog.push({
            role: 'config',
            text: message.content?.trim() || 'Configuration mise à jour ✓'
          })
          this.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: 'Configuration appliquée avec succès.'
          })
        } else {
          this.chatLog.push({
            role: 'error',
            text: `Outil inconnu appelé par Albert : ${toolCall.function.name}`
          })
        }
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : 'Erreur inconnue lors de la génération.'
        // calls go through our own same-origin /api/albert-* proxy, so a
        // network-level failure here means the proxy itself is
        // unreachable — e.g. running via `pnpm run dev` (Vite alone
        // doesn't serve /api/*, only `vercel dev` or an actual Vercel
        // deployment does), not CORS.
        this.error =
          e instanceof TypeError
            ? `${message} (échec réseau vers /api/albert-* — en local, cette route n'existe que sous \`vercel dev\`, pas sous \`pnpm run dev\`.)`
            : message
        this.chatLog.push({ role: 'error', text: this.error })
      } finally {
        this.loading = false
      }
    }
  }
})

// exported for the "current config as YAML" preview refresh in
// ConfigEditorView.vue — kept here rather than duplicated
export const currentConfigYaml = () => dump(toRaw(config), { lineWidth: -1 })

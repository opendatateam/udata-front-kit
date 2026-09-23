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
Utilise l'outil ask_question si le thème du site n'est pas assez précis pour choisir un tag data.gouv.fr pertinent — une seule question à la fois.
Utilise l'outil propose_config dès que tu as assez d'éléments pour une première proposition, même imparfaite : l'utilisateur pourra ensuite demander des ajustements, tu rappelleras alors propose_config avec la version mise à jour.
Les couleurs doivent être une palette pastel harmonieuse en dégradé. Le tag doit être court, en minuscules, sans accents.
N'appelle jamais les deux outils dans la même réponse.`

// Validated live against the real API: both models tried returned correct
// tool_calls with arguments matching this schema exactly, no markdown
// fence to strip.
const ALBERT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'ask_question',
      description:
        "Pose une question de clarification à l'utilisateur avant de proposer une configuration, si le thème du site n'est pas assez précis pour choisir un tag data.gouv.fr pertinent.",
      parameters: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description:
              'La question à poser, en français, une seule à la fois.'
          }
        },
        required: ['question']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'propose_config',
      description:
        "Propose une configuration de site data.gouv.fr une fois qu'on a assez d'informations sur le thème souhaité.",
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
                required: ['title', 'subtitle']
              },
              footer: {
                type: 'object',
                properties: { phrase: { type: 'string' } },
                required: ['phrase']
              },
              home_banner_colors: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3
              }
            },
            required: ['title', 'homepage', 'footer', 'home_banner_colors']
          },
          pages: {
            type: 'object',
            properties: {
              datasets: {
                type: 'object',
                properties: {
                  universe_query: {
                    type: 'object',
                    properties: { tag: { type: 'string' } },
                    required: ['tag']
                  }
                },
                required: ['universe_query']
              }
            },
            required: ['datasets']
          }
        },
        required: ['website', 'pages']
      }
    }
  }
]

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

const initialMessages = (systemPrompt: string): AlbertMessage[] => [
  { role: 'system', content: systemPrompt }
]

export const useAlbertChatStore = defineStore('albertChat', {
  state: (): AlbertChatState => {
    const systemPrompt =
      LocalStorageService.getItem(ALBERT_PROMPT_KEY) ??
      DEFAULT_ALBERT_SYSTEM_PROMPT
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
    reset() {
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
      this.loading = true

      console.log('[Albert] system prompt used:', this.systemPrompt)
      console.log('[Albert] full messages sent:', this.messages)
      // The model sees these tool descriptions on every request regardless
      // of the system prompt — e.g. propose_config's description literally
      // says "Propose une configuration de site data.gouv.fr...", which is
      // why the model still references "une configuration" even under an
      // unrelated/joke system prompt.
      console.log('[Albert] tools sent:', ALBERT_TOOLS)

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
            tools: ALBERT_TOOLS,
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
          const title = (args.website as Record<string, unknown> | undefined)
            ?.title
          const tag = (
            (
              (args.pages as Record<string, unknown> | undefined)?.datasets as
                | Record<string, unknown>
                | undefined
            )?.universe_query as Record<string, unknown> | undefined
          )?.tag
          this.chatLog.push({
            role: 'config',
            text: `Configuration mise à jour ✓ « ${title ?? '?'} » (tag : ${tag ?? '?'})`
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

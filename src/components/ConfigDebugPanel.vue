<script setup lang="ts">
import { computed, ref } from 'vue'

import config, { rawConfig } from '@/config'
import { diffConfig } from '@/utils/configDiff'

const open = ref(false)

// Reading through the reactive `config` proxy here (not toRaw) means this
// computed re-tracks on every nested change made by the config editor,
// Albert, or the universe manager — no manual invalidation needed.
const diffs = computed(() => diffConfig(rawConfig, config))

const format = (value: unknown) => {
  if (value === undefined) return '—'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}
</script>

<template>
  <div class="config-debug-panel">
    <button
      type="button"
      class="config-debug-toggle"
      :aria-expanded="open"
      @click="open = !open"
    >
      ⚙ config{{ diffs.length ? ` · ${diffs.length}` : '' }}
    </button>

    <div v-if="open" class="config-debug-window">
      <div class="config-debug-header">
        <span>Modifications vs config.yaml</span>
        <button
          type="button"
          class="config-debug-close"
          aria-label="Fermer"
          @click="open = false"
        >
          ✕
        </button>
      </div>
      <p v-if="!diffs.length" class="config-debug-empty">
        Aucune modification pour le moment.
      </p>
      <ul v-else class="config-debug-list">
        <li v-for="diff in diffs" :key="diff.path">
          <div class="config-debug-path">{{ diff.path }}</div>
          <div class="config-debug-before">− {{ format(diff.before) }}</div>
          <div class="config-debug-after">+ {{ format(diff.after) }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.config-debug-panel {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 2000;
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-size: 0.75rem;
}

.config-debug-toggle {
  display: block;
  margin-left: auto;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #3a3a3a;
  background-color: #1e1e1e;
  color: #e5e5e5;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.config-debug-toggle:hover {
  background-color: #2c2c2c;
}

.config-debug-window {
  margin-top: 0.5rem;
  width: min(26rem, calc(100vw - 2rem));
  max-height: min(24rem, calc(100vh - 6rem));
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #e5e5e5;
  border: 1px solid #3a3a3a;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.config-debug-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: #262626;
  border-bottom: 1px solid #3a3a3a;
  font-weight: bold;
}
.config-debug-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.85rem;
}

.config-debug-empty {
  padding: 0.75rem;
  color: #9a9a9a;
}

.config-debug-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.config-debug-list li {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #2c2c2c;
}
.config-debug-list li:last-child {
  border-bottom: none;
}
.config-debug-path {
  color: #7ab8ff;
  margin-bottom: 0.15rem;
  word-break: break-all;
}
.config-debug-before {
  color: #ff8a8a;
  white-space: pre-wrap;
  word-break: break-word;
}
.config-debug-after {
  color: #8ce99a;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

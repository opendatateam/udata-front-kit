<script setup lang="ts">
import { formatNumber } from './format'

defineProps<{
  year: number
  value: number
  unite: string
}>()
</script>

<template>
  <div class="one-year-value">
    <div>
      <span class="year">{{ year }} : </span>
      <span class="value">{{ formatNumber(value) }} {{ unite }}</span>
    </div>
    <p class="help">Seule année de données disponible.</p>
  </div>
</template>

<style scoped>
.one-year-value {
  margin-top: 32px;
  margin-bottom: 64px;
}

.year {
  font-size: 1.5rem;
  font-weight: bold;
  color: #000091;
}

.value {
  font-size: 2.5rem;
  font-weight: 900;
  margin-left: 1rem;
  color: #000091;
}

.help {
  font-size: 0.7rem;
  color: #797979;
  margin-top: 8px;
}
</style>

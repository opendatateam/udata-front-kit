<script lang="ts" setup>
import { computed } from 'vue'

import {
  BLUE,
  GOLD,
  integerFormat,
  ORANGE,
  PLUM,
  PURPLE,
  RED,
  SKY,
  TEAL,
  type PieSlice
} from '@/custom/justice/utils/chartTheme'

const BAR_COLORS = [BLUE, PURPLE, RED, GOLD, TEAL, ORANGE, PLUM, SKY, '#417DC4']

const percentFormat = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 0
})

const props = defineProps<{
  slices: PieSlice[]
  accessibleLabel: string
}>()

const bars = computed(() => {
  const total = props.slices.reduce((sum, slice) => sum + slice.value, 0)
  const max = Math.max(0, ...props.slices.map((slice) => slice.value))
  return props.slices.map((slice, index) => ({
    label: slice.label,
    value: slice.value,
    width: max === 0 ? 0 : (slice.value / max) * 100,
    share: total === 0 ? 0 : slice.value / total,
    color: BAR_COLORS[index % BAR_COLORS.length]
  }))
})
</script>

<template>
  <ul class="bars" :aria-label="accessibleLabel">
    <li v-for="bar in bars" :key="bar.label">
      <p class="label">{{ bar.label }}</p>
      <div class="row">
        <div class="track">
          <div
            class="fill"
            :style="{ width: `${bar.width}%`, background: bar.color }"
          />
        </div>
        <p class="figures">
          <span class="value">{{ integerFormat.format(bar.value) }}</span>
          <span class="share">{{ percentFormat.format(bar.share) }}</span>
        </p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.bars {
  margin: 0;
  padding: 0;
  list-style: none;
}

.bars li + li {
  margin-top: 0.85rem;
}

.label {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  line-height: 1.3;
}

.row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.track {
  flex: 1;
  height: 0.85rem;
  background: var(--background-contrast-grey, #eee);
}

.fill {
  height: 100%;
}

.figures {
  display: flex;
  flex-shrink: 0;
  gap: 0.5rem;
  justify-content: flex-end;
  min-width: 8.5rem;
  margin: 0;
  font-variant-numeric: tabular-nums;
  font-size: 0.875rem;
}

.share {
  color: var(--text-mention-grey, #666);
}
</style>

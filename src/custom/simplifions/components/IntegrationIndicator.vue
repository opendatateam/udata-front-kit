<template>
  <span class="integration-indicator">
    <span :class="['indicator-count', colorClass]"
      >{{ integratedCount }}/{{ totalCount }}</span
    >
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  integratedCount: number
  totalCount: number
}>()

const percentage = computed(() => {
  if (props.totalCount === 0) return 0
  return (props.integratedCount / props.totalCount) * 100
})

const colorClass = computed(() => {
  if (percentage.value >= 75) return 'indicator-count--green'
  if (percentage.value >= 50) return 'indicator-count--blue'
  if (percentage.value >= 25) return 'indicator-count--yellow'
  return 'indicator-count--red'
})
</script>

<style scoped>
.integration-indicator {
  display: inline-flex;
  align-items: center;
}

.indicator-count {
  font-size: 0.875rem;
  font-weight: 700;
}

.indicator-count--green {
  color: #18753c;
}

.indicator-count--blue {
  color: #000091;
}

.indicator-count--yellow {
  color: #b34000;
}

.indicator-count--red {
  color: #ce0500;
}
</style>

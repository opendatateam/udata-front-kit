<template>
  <span class="integration-indicator">
    <span :class="['indicator-count', colorClass]"
      >{{ integratedCount }}/{{ totalCount }}</span
    >
  </span>
</template>

<script setup lang="ts">
defineProps<{
  integratedCount: number
  totalCount: number
  colorClass: string
}>()
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

.indicator-count.indicator--green {
  background-color: rgb(184, 254, 201);
}

.indicator-count.indicator--yellow {
  background-color: rgb(254, 240, 184);
}

.indicator-count.indicator--orange {
  background-color: rgb(254, 224, 184);
}

.indicator-count.indicator--red {
  background-color: rgb(254, 201, 201);
}
</style>

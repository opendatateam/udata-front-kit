<template>
  <span class="tooltip-wrapper">
    <span class="tooltip-trigger">
      <slot name="trigger" />
    </span>
    <span
      :class="[
        'tooltip-content',
        isTop ? 'tooltip-content--top' : 'tooltip-content--bottom'
      ]"
    >
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  maxWidth?: string
  placement?: 'top' | 'bottom'
}>()

const isTop = computed(() => props.placement === 'top')
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-trigger {
  cursor: help;
}

.tooltip-content {
  display: none;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 4px;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--grey-50-1000);
  width: max-content;
  max-width: v-bind("maxWidth || '20rem'");
  z-index: 1000;
  line-height: 1.4;
}

.tooltip-content--bottom {
  top: calc(100% + 0.5rem);
}

.tooltip-content--top {
  bottom: calc(100% + 0.5rem);
}

.tooltip-content--bottom::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: white;
}

.tooltip-content--top::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: white;
}

.tooltip-wrapper:hover .tooltip-content {
  display: block;
}
</style>

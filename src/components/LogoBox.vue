<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    size?: number
    padding?: number
  }>(),
  { alt: '', size: 32, padding: 6 }
)

const style = computed(() => {
  const outerSize = props.size + props.padding * 2 + 1
  return {
    width: `${outerSize}px`,
    height: `${outerSize}px`,
    padding: `${props.padding}px`
  }
})
</script>

<template>
  <div class="logo-box" :style="style">
    <img :src="src" :alt="alt" loading="lazy" :width="size" :height="size" />
  </div>
</template>

<style scoped>
.logo-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--border-default-grey);
}
</style>

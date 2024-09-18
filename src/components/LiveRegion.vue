<script lang="ts" setup>
interface InfoToAnnounce {
  text: string
}

export type { InfoToAnnounce }

defineProps({
  infos: {
    type: Object as () => InfoToAnnounce[],
    required: true
  },
  ariaLiveMode: {
    type: String as () => 'assertive' | 'polite' | 'off',
    required: false,
    default: () => 'polite'
  }
})
</script>

<template>
  <ul id="sr-info" class="frr-only" :aria-live="ariaLiveMode" role="list">
    <li v-for="(info, index) in infos" :key="index">{{ info.text }}</li>
  </ul>
</template>

<style></style>

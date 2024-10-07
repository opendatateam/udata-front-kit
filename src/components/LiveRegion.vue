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
  <div :aria-live="ariaLiveMode" role="status">
    <ul class="fr-sr-only" role="list">
      <li v-for="(info, index) in infos" :key="index">{{ info.text }}</li>
    </ul>
  </div>
</template>

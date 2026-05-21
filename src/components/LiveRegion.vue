<script lang="ts" setup>
import { DebugLogger } from '@/utils/debug'

interface InfoToAnnounce {
  text: string
}

export type { InfoToAnnounce }

const props = defineProps({
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

const debug = new DebugLogger('LiveRegion')

watch(
  () => props.infos,
  () => {
    debug.log('Announcement', JSON.stringify(props.infos))
  },
  { immediate: true }
)
</script>

<template>
  <div :aria-live="ariaLiveMode" role="status">
    <ul class="fr-sr-only" role="list">
      <li v-for="(info, index) in infos" :key="index">{{ info.text }}</li>
    </ul>
  </div>
</template>

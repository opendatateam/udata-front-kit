<script lang="ts" setup>
import { ref } from 'vue'
import type { Ref } from 'vue'

import { useLoader } from '@/composables/loader'

const count: Ref<number> = ref(0)
const data: Ref<string> = ref('Knock, knock!')

const wait: () => Promise<string> = () => {
  count.value += 1

  return new Promise((resolve, reject) => {
    if (count.value > 1) reject('Go away!')
    resolve('Who’s there?')
  })
}

const ring: () => Promise<string> = async () => {
  const loaded = useLoader(wait)

  return loaded()
    .then((response: string) => (data.value = response))
    .catch((error: string) => (data.value = error))
    .finally(() => (data.value = 'Police!'))
}
</script>
<template>
  <div>{{ data }}</div>
  <button @click="ring">Doorbell</button>
</template>

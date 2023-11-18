<script lang="ts" setup>
import { Ref, ref } from 'vue'

import { withToaster } from '@/utils/hocs'

const count: Ref<number> = ref(0)
const data: Ref<string> = ref('Knock, knock!')

const wait: () => Promise<Record<string, string>> = () => {
  count.value += 1

  return new Promise((resolve, reject) => {
    if (count.value > 1) reject({ message: 'Go away!' })
    resolve({ data: 'Who’s there?' })
  })
}

const ring: () => Promise<string> = async () => {
  const toasted = withToaster(wait)

  return toasted()
    .then((response: Record<string, string>) => (data.value = response.data))
    .catch((error: Record<string, string>) => (data.value = error.message))
}
</script>
<template>
  <div>{{ data }}</div>
  <button @click="ring">Doorbell</button>
</template>

<script lang="ts" setup>
import { Ref, ref } from 'vue'

const count: Ref<number> = ref(0)
const data: Ref<string> = ref('Knock, knock!')
const acc: () => number = () => (count.value += 1)
const ring: () => Promise<string> = async () => {
  return wait()
    .then((response: string) => (data.value = response))
    .catch((error: string) => (data.value = error))
}
const wait: () => Promise<string> = () => {
  return new Promise((resolve, reject) => {
    if (count.value > 1) reject('Go away!')
    resolve('Who’s there?')
  })
}
</script>
<template>
  <div>{{ data }}</div>
  <button @click="acc(), ring()">Doorbell</button>
</template>

<template>
  <span>
    <span v-for="(item, index) in humanReadableList(items)" :key="item.content">
      <span :class="{ 'font-bold': item.bold }">{{ item.content }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: string[]
}>()

const humanReadableList = (items: string[]) => {
  const acc: { content: string; bold: boolean }[] = []
  items.forEach((item, index) => {
    if (index === items.length - 1) {
      acc.push({ content: ' et ', bold: false })
    } else if (index != 0) {
      acc.push({ content: ', ', bold: false })
    }
    acc.push({ content: item, bold: true })
  })
  return acc
}
</script>

<style scoped>
.font-bold {
  font-weight: bold;
}
</style>

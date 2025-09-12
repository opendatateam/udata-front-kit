<template>
  <span>
    <span v-for="item in humanReadableList(items)" :key="item.content">
      <span :class="{ 'font-bold': item.bold }">{{ item.content }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: string[]
    boldItems?: boolean
    lastItemSeparator?: string
  }>(),
  {
    boldItems: true,
    lastItemSeparator: 'et'
  }
)

const humanReadableList = (items: string[]) => {
  const acc: { content: string; bold: boolean }[] = []
  items.forEach((item, index) => {
    if (index === items.length - 1 && items.length >= 2) {
      acc.push({ content: ` ${props.lastItemSeparator} `, bold: false })
    } else if (index != 0) {
      acc.push({ content: ', ', bold: false })
    }
    acc.push({ content: item, bold: props.boldItems })
  })
  return acc
}
</script>

<style scoped>
.font-bold {
  font-weight: bold;
}
</style>

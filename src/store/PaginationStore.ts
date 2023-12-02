import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

import type { Pagination } from '@/model/pagination'

const usePaginationStore = defineStore('pagination', () => {
  const dataCount: Ref<number> = ref<number>(0)
  const dataPerPage: Ref<number> = ref<number>(20)

  const pages: ComputedRef<number> = computed<number>(() => {
    return Math.ceil(dataCount.value / dataPerPage.value)
  })

  const pagesToArray: ComputedRef<number[]> = computed<number[]>(() => {
    return [...Array(pages.value).keys()].map((page) => page + 1)
  })

  const pagination: ComputedRef<Pagination[]> = computed<Pagination[]>(() => {
    return pagesToArray.value.map((page) => {
      return {
        label: page,
        href: '#',
        title: `Page ${page}`
      }
    })
  })

  return { dataCount, dataPerPage, pages, pagesToArray, pagination }
})

export { usePaginationStore }

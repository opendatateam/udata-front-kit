import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { Pagination } from '@/model/pagination'

const usePaginationStore = defineStore('pagination', () => {
  const dataCount: Ref<number> = ref(0)
  const dataPerPage: Ref<number> = ref(20)

  /**
   * Calculate the number of pages.
   * @returns {number}
   */
  const pages: ComputedRef<number> = computed(() => {
    return Math.ceil(dataCount.value / dataPerPage.value)
  })

  /**
   * Convert number of pages to array.
   * @returns {number[]}
   */
  const pagesToArray: ComputedRef<number[]> = computed(() => {
    return [...Array(pages.value).keys()].map((page) => page + 1)
  })

  /**
   * Create a collection of pagination objects.
   * @returns {Pagination[]}
   */
  const pagination: ComputedRef<Pagination[]> = computed(() => {
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

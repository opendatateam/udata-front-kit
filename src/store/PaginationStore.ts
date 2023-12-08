import { defineStore } from 'pinia'
import { computed, toValue, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { Page } from '@/model/page'

const usePaginationStore = defineStore('pagination', () => {
  const dataCount: Ref<number> = ref(0)
  const dataPerPage: Ref<number> = ref(0)

  /**
   * Calculate the number of pages.
   * @returns {number}
   */
  const pagesCount: ComputedRef<number> = computed(() => {
    const count: number | undefined = toValue(dataCount)
    const perPage: number = toValue(dataPerPage)
    if (perPage === 0) return perPage
    return Math.ceil(count / perPage)
  })

  /**
   * Convert number of pages to array.
   * @returns {number[]}
   */
  const pagesToArray: ComputedRef<number[]> = computed(() => {
    const count: number = toValue(pagesCount)
    return [...Array(count).keys()].map((page) => page + 1)
  })

  /**
   * Create a collection of pagination objects.
   * @returns {Page[]}
   */
  const pages: ComputedRef<Page[]> = computed(() => {
    return toValue(pagesToArray).map((page) => {
      return {
        label: String(page),
        href: '#',
        title: `Page ${page}`
      }
    })
  })

  return { dataCount, dataPerPage, pages, pagesCount, pagesToArray }
})

export { usePaginationStore }

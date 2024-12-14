import config from '@/config'
import type { CanAddElementConf, SearchConf } from '@/model/config'
import type { SiteId } from '@/model/topic'
interface SearchPageConfNormalized {
  searchPageName: string
  searchPageSlug: string
  searchPageType: string
  searchPageExtrasKey: SiteId
  searchPageDatasetEditorialization: boolean
  searchPageCanAdd: CanAddElementConf
  searchPageListAll: boolean
  searchPageDisplayMetadata: boolean
  searchPageActivateReadMore: boolean
}

export const useSearchPagesConfig = (
  value: string
): SearchPageConfNormalized => {
  const searchPageConf = config.website.search_config.pages.find(
    (page: SearchConf) => page.slug === value
  ) as SearchConf
  return {
    searchPageName: searchPageConf.name,
    searchPageSlug: searchPageConf.slug,
    searchPageType: searchPageConf.type,
    searchPageExtrasKey: searchPageConf.extras_key,
    searchPageDatasetEditorialization: searchPageConf.dataset_editorialization,
    searchPageCanAdd: searchPageConf.can_add,
    searchPageListAll: searchPageConf.list_all,
    searchPageDisplayMetadata: searchPageConf.display_metadata,
    searchPageActivateReadMore: searchPageConf.activate_read_more
  }
}

export const getAllSearchPagesConfig = (): SearchPageConfNormalized[] => {
  const allSearchPages = config.website.search_config.pages as SearchConf[]
  return allSearchPages.map((page) => useSearchPagesConfig(page.slug))
}

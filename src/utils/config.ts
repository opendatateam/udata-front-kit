import config from '@/config'
import type { CanAddElementConf, FilterConf, SearchConf } from '@/model/config'
import type { SiteId } from '@/model/topic'
interface SearchPageConfNormalized {
  searchPageName: string
  searchPageSlug: string
  searchPageType: string
  searchPageConfigTypeOrganization: string
  searchPageConfigTypeTopic: string
  searchPageConfigTypeCard: string
  searchPageConfigDescriptionComponent: string
  searchPageExtrasKey: SiteId
  searchPageDatasetEditorialization: boolean
  searchPageGeozones: boolean
  searchPageCanAdd: CanAddElementConf
  searchPageListAll: boolean
  searchPageDisplayMetadata: boolean
  searchPageActivateReadMore: boolean
  searchPageFilters: FilterConf[]
  searchPageLabelTitle: string
  searchPageLabelBarTitle: string
  searchPageLabelResults: string
  searchPageLabelAddButton: string
  searchPageLabelAddPageTitle: string
  searchPageLabelAddSubtitle: string
  searchPageLabelSubject: string
  searchPageLabelDescriptionTitle: string
  searchPageLabelDescriptionInfo: string
  searchPageLabelOwner: string
}

export const useSearchPagesConfig = (
  value: string
): SearchPageConfNormalized => {
  let searchPageConf = config.website.search_config.pages.find(
    (page: SearchConf) => page.slug === value
  ) as SearchConf
  if (!searchPageConf) {
    searchPageConf = config.website.search_config.pages[0]
  }
  return {
    searchPageName: searchPageConf.name,
    searchPageSlug: searchPageConf.slug,
    searchPageType: searchPageConf.type,
    searchPageConfigTypeOrganization: searchPageConf.config_type.organization,
    searchPageConfigTypeTopic: searchPageConf.config_type.topic,
    searchPageConfigTypeCard: searchPageConf.config_type.card,
    searchPageConfigDescriptionComponent:
      searchPageConf.config_type.description_component,
    searchPageExtrasKey: searchPageConf.extras_key,
    searchPageDatasetEditorialization: searchPageConf.dataset_editorialization,
    searchPageGeozones: searchPageConf.searchPageGeozones,
    searchPageCanAdd: searchPageConf.can_add,
    searchPageListAll: searchPageConf.list_all,
    searchPageDisplayMetadata: searchPageConf.display_metadata,
    searchPageActivateReadMore: searchPageConf.activate_read_more,
    searchPageFilters: searchPageConf.filters,
    searchPageLabelTitle: searchPageConf.labels.search_page_title,
    searchPageLabelBarTitle: searchPageConf.labels.search_bar_title,
    searchPageLabelResults: searchPageConf.labels.search_results,
    searchPageLabelAddButton: searchPageConf.labels.add_button,
    searchPageLabelAddPageTitle: searchPageConf.labels.add_title,
    searchPageLabelAddSubtitle: searchPageConf.labels.add_subtitle,
    searchPageLabelSubject: searchPageConf.labels.subject,
    searchPageLabelDescriptionTitle: searchPageConf.labels.description_title,
    searchPageLabelDescriptionInfo: searchPageConf.labels.description_info,
    searchPageLabelOwner: searchPageConf.labels.owner
  }
}

export const getAllSearchPagesConfig = (): SearchPageConfNormalized[] => {
  const allSearchPages = config.website.search_config.pages as SearchConf[]
  return allSearchPages.map((page) => useSearchPagesConfig(page.slug))
}

import { usePageConf } from './config'

export const useUniverseQuery = (pageKey: string, tags: string[]) => {
  const pageConf = usePageConf(pageKey)
  const { tag: universeTag, ...universeQuery } = pageConf.universe_query
  return {
    tagsWithUniverse: [...tags, universeTag].filter(Boolean).map(String),
    universeQuery: universeQuery || {}
  }
}

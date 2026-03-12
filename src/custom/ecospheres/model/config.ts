export interface EcologieHomepageThematicTag {
  label: string
  q: string
}

export interface EcologieHomepageCollectionConf {
  title: string
  description: string
  creator: string
  maille: string
  slug: string
}

export interface EcologieHomepageNewsItemConf {
  date: string
  title: string
  href?: string
}

export interface EcologieHomepageConf {
  collections: EcologieHomepageCollectionConf[]
  thematic_tags: EcologieHomepageThematicTag[]
  about_text: string
  news: EcologieHomepageNewsItemConf[]
}

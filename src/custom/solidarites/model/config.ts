export interface SubSectionCardsConf {
  title: string
  cards: []
}

export interface NewsItemConf {
  sub_section_cards: SubSectionCardsConf
}

export interface OutilsItemConf {
  description: string
  title: string
  href: string
  href_title: string
  img: string
}

export interface WebinairesItemConf {
  description: string
  title: string
  href: string
  href_title: string
  img: string
  date: string
}

export interface SelectionsItemConf {
  title: string
  href: string
}

export interface OutilsConf {
  outils: OutilsItemConf[]
}

export interface WebinairesConf {
  webinaires: WebinairesItemConf[]
}

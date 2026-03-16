import type { PageLabelsConf } from '@/model/config'

export type Labels = {
  singular: string
  plural: string
  extended: string
  articles: {
    un: string
    le: string
    du: string
    au: string
    ce: string
    nouveau: string
    il: string
    eSuffixe: string
    unDeVos: string
  }
}

export function useLabels(labels: PageLabelsConf): Labels {
  const f = labels.feminine ?? false
  return {
    singular: labels.singular,
    plural: labels.plural,
    extended: labels.extended,
    articles: {
      un: f ? 'une' : 'un',
      le: f ? 'la' : 'le',
      du: f ? 'de la' : 'du',
      au: f ? 'à la' : 'au',
      ce: f ? 'cette' : 'ce',
      nouveau: f ? 'Nouvelle' : 'Nouveau',
      il: f ? 'elle' : 'il',
      eSuffixe: f ? 'e' : '',
      unDeVos: f ? 'une de vos' : 'un de vos'
    }
  }
}

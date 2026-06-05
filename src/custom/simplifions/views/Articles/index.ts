import type { FeaturedItem, SimplifionsArticleCard } from '../../model/articles'
import { buildSimplifionsArticleCard } from '../../model/articles'
import { articleMeta as apiFranceConnecteesArticleMeta } from './ApisFranceConnectees/ApisFranceConnectees.vue'
import { articleMeta as nouvelArticleSansDossier } from './NouvelArticleSansDossier.vue'
import { articleMeta as ditesLeNousUneFois } from './DitesLeNousUneFois.vue'
import { themeMeta as apiFranceConnecteesFolderMeta } from './ApisFranceConnectees'
import { articleMeta as guideBaseArticleMeta } from './GuidesBases/GuideBasePetitesCollectivites.vue'
import { themeMeta as guideBaseFolderMeta } from './GuidesBases'
import { guidesMeta } from './meta'

export { guidesMeta as themeMeta } from './meta'

const parentPath = `/${guidesMeta.id}`

export const folders = [
  {
    meta: guideBaseFolderMeta,
    articles: [buildSimplifionsArticleCard(guideBaseFolderMeta, guideBaseArticleMeta, parentPath)]
  },
  {
    meta: apiFranceConnecteesFolderMeta,
    articles: [buildSimplifionsArticleCard(apiFranceConnecteesFolderMeta, apiFranceConnecteesArticleMeta, parentPath)]
  }
]

export const articles = folders.flatMap((f) => f.articles)

export const rootArticles: SimplifionsArticleCard[] = [
  buildSimplifionsArticleCard(null, nouvelArticleSansDossier, parentPath),
  buildSimplifionsArticleCard(null, ditesLeNousUneFois, parentPath)
]

export const folderById = (id: string): FeaturedItem => {
  const f = folders.find((f) => f.meta.id === id)!
  return { type: 'folder', meta: f.meta, to: `${parentPath}/${f.meta.id}`, articleCount: f.articles.length }
}

export const articleById = (id: string): FeaturedItem => {
  const allCards = [...articles, ...rootArticles]
  const card = allCards.find((a) => a.id === id)!
  return { type: 'article', card }
}

// ← Modifier cette liste pour changer ce qui apparaît en une sur la page d'accueil.
// L'ordre ici = l'ordre dans le carrousel. Commenter une ligne = retirer de la une.
export const featuredItems: FeaturedItem[] = [
  articleById('guide-base-petites-collectivites'),
  folderById('api-franceconnectees')
]

import { buildSimplifionsArticleCard } from '../../model/articles'
import { articleMeta as apiFranceConnecteesArticleMeta } from '../ApisFranceConnectees/ApisFranceConnectees.vue'
import { themeMeta as apiFranceConnecteesFolderMeta } from '../ApisFranceConnectees'
import { articleMeta as guideBaseArticleMeta } from '../GuidesBases/GuideBasePetitesCollectivites.vue'
import { themeMeta as guideBaseFolderMeta } from '../GuidesBases'

export const themeMeta = {
  id: 'articles',
  label: 'Articles',
  title: 'Guides et recommandations',
  description:
    'Consulter nos différents articles pour comprendre et choisir :'
}

export const articles = [
  buildSimplifionsArticleCard(
    guideBaseFolderMeta,
    guideBaseArticleMeta
  ),
  buildSimplifionsArticleCard(
    apiFranceConnecteesFolderMeta,
    apiFranceConnecteesArticleMeta
  )
]

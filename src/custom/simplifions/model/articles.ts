export const ARTICLE_KEYWORD_CATEGORIES = [
  "Type d'article",
  'Type de données',
  'Vous êtes ...',
  'Thématique'
] as const

export type ArticleKeywordCategory = (typeof ARTICLE_KEYWORD_CATEGORIES)[number]

export interface ArticleKeyword {
  label: string
  category: ArticleKeywordCategory
}

export function groupArticleKeywords(keywords: ArticleKeyword[]) {
  const byCategory = (category: ArticleKeywordCategory) =>
    keywords.filter((keyword) => keyword.category === category)

  return {
    articleTypeKeywords: byCategory("Type d'article"),
    dataTypeKeywords: byCategory('Type de données'),
    audienceKeywords: byCategory('Vous êtes ...'),
    otherKeywords: keywords.filter(
      (keyword) =>
        keyword.category !== "Type d'article" &&
        keyword.category !== 'Type de données' &&
        keyword.category !== 'Vous êtes ...'
    )
  }
}

export const ARTICLE_KEYWORDS = {
  guideDeBase: { label: 'Guide de base', category: "Type d'article" },
  guideMetier: { label: 'Guide métier', category: "Type d'article" },
  guideTechnique: { label: 'Guide technique', category: "Type d'article" },
  definition: { label: 'Définition', category: "Type d'article" },
  api: { label: 'API', category: 'Type de données' },
  jeuxDeDonnees: { label: 'Jeux de données', category: 'Type de données' },
  petiteCollectivite: { label: 'Petite collectivité', category: 'Vous êtes ...' },
  dsi: { label: 'DSI', category: 'Vous êtes ...' },
  moa: { label: 'MOA', category: 'Vous êtes ...' },
  editeurDeLogiciels: { label: 'Éditeur de logiciels', category: 'Vous êtes ...' },
  parcoursUsager: { label: 'Parcours usager', category: 'Thématique' },
  integrationTechnique: { label: 'Intégration technique', category: 'Thématique' },
  apiFranceConnectees: { label: 'API FranceConnectées', category: 'Thématique' }
} as const satisfies Record<string, ArticleKeyword>

export interface ArticleMeta {
  slug: string
  h1: string
  title: string
  description: string
  imageSrc?: string
  articleCategory?: 'guide'
  showNoDevelopmentBadge?: boolean
  articleKeywords: ArticleKeyword[]
  heroBackdropGradient: string
  heroPanelBackground: string
}

export const articleQuestCeQuUneAPI: ArticleMeta = {
  slug: 'qu-est-ce-qu-une-api',
  h1: "Qu'est-ce qu'une API ?",
  title: "Qu'est-ce qu'une API ? Explication simple pour les non-techniciens",
  description:
    "Comprendre ce qu'est une API sans vocabulaire technique : comment ces outils permettent aux administrations d'échanger des données pour simplifier les démarches des entreprises, associations et particuliers.",
  articleCategory: 'guide',
  showNoDevelopmentBadge: false,
  articleKeywords: [ARTICLE_KEYWORDS.api, ARTICLE_KEYWORDS.definition, ARTICLE_KEYWORDS.petiteCollectivite, ARTICLE_KEYWORDS.moa],
  heroBackdropGradient: 'linear-gradient(135deg, #decdbd 0%, #d2e2f6 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}

export const articleApisFranceConnectees: ArticleMeta = {
  slug: 'apis-franceconnectees',
  h1: 'Les APIs FranceConnectées',
  title: `Administrations, pré-remplissez les démarches FranceConnectées`,
  description: `Les API FranceConnectées donnent accès à diverses données administratives des particuliers en proposant FranceConnect comme modalité d'appel. Elles permettent de simplifier les démarches d'un particulier utilisant FranceConnect en récupérant automatiquement d'autres informations administratives le concernant.`,
  articleKeywords: [ARTICLE_KEYWORDS.api, ARTICLE_KEYWORDS.guideMetier, ARTICLE_KEYWORDS.apiFranceConnectees, ARTICLE_KEYWORDS.dsi, ARTICLE_KEYWORDS.moa, ARTICLE_KEYWORDS.editeurDeLogiciels, ARTICLE_KEYWORDS.definition],
  heroBackdropGradient: 'linear-gradient(135deg, #a19237 0%, #fddede 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}

export const articleGuideBasePetitesCollectivites: ArticleMeta = {
  slug: 'guide-base-petites-collectivites',
  h1: 'Guide de base pour les petites collectivités',
  title: 'Petites communes : un guide pour simplifier vos démarches',
  description:
    "Petites collectivités, simplifiez vos démarches administratives sans développement : portails publics gratuits et logiciels éditeurs déjà raccordés aux données vous permettent d'éviter de les redemander aux usagers.",
  imageSrc:
    '/static/simplifions/assets/image-guide-de-base-collectivites-guichet-mairie-2.jpg',
  articleKeywords: [ARTICLE_KEYWORDS.guideDeBase, ARTICLE_KEYWORDS.petiteCollectivite],
  articleCategory: 'guide',
  showNoDevelopmentBadge: true,
  heroBackdropGradient: 'linear-gradient(135deg, #34BAB5 0%, #d2e2f6 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}

export const articlePrerequisEtapesIntegrationAPI: ArticleMeta = {
  slug: 'prerequis-et-etapes-integration-api',
  h1: "Prérequis et étapes d'intégration d'une API",
  title: "Prérequis et étapes d'intégration d'une API",
  description:
    "Prérequis techniques, juridiques et d'usage, étapes d'intégration, limites à connaître : Acteurs publics, ce guide vous aide à comprendre ce qui vous attend lorsque vous vous engagez dans la simplification de vos démarches grâce aux API.",
  articleKeywords: [
    ARTICLE_KEYWORDS.api,
    ARTICLE_KEYWORDS.guideTechnique,
    ARTICLE_KEYWORDS.guideMetier,
    ARTICLE_KEYWORDS.integrationTechnique, ARTICLE_KEYWORDS.dsi, ARTICLE_KEYWORDS.moa, ARTICLE_KEYWORDS.editeurDeLogiciels
  ],
  heroBackdropGradient: 'linear-gradient(135deg, #decdbd 0%, #a3afce 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}

export const articleVosInterlocuteursSelonTypeAPI: ArticleMeta = {
  slug: 'vos-interlocuteurs-selon-le-type-d-api',
  h1: "Vos interlocuteurs selon le type d'API",
  title: "Vos interlocuteurs selon le type d'API",
  description:
    "Identifiez votre interlocuteur selon le type d'API que vous intégrez et selon votre situation.",
  articleKeywords: [ARTICLE_KEYWORDS.api, ARTICLE_KEYWORDS.guideMetier, ARTICLE_KEYWORDS.dsi, ARTICLE_KEYWORDS.moa, ARTICLE_KEYWORDS.editeurDeLogiciels],
  heroBackdropGradient: 'linear-gradient(135deg, #decdbd 0%, #e3e3fd 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}

export const articleAnticiperParcoursUsager: ArticleMeta = {
  slug: 'anticiper-le-parcours-usager-avant-d-integrer-vos-api',
  h1: "Anticiper le parcours usager avant d'intégrer vos API",
  title: "Anticiper le parcours usager avant d'intégrer vos API",
  description:
    'API délivrant des données publiques ou protégées : ce guide détaille les parcours usager possibles pour intégrer une API.',
  articleKeywords: [ARTICLE_KEYWORDS.api, ARTICLE_KEYWORDS.parcoursUsager, ARTICLE_KEYWORDS.guideMetier, ARTICLE_KEYWORDS.dsi, ARTICLE_KEYWORDS.moa, ARTICLE_KEYWORDS.editeurDeLogiciels],
  heroBackdropGradient: 'linear-gradient(135deg, #decdbd 0%, #cfe0ef 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}

export const articles: ArticleMeta[] = [
  articleQuestCeQuUneAPI,
  articleApisFranceConnectees,
  articleGuideBasePetitesCollectivites,
  articlePrerequisEtapesIntegrationAPI,
  articleVosInterlocuteursSelonTypeAPI,
  articleAnticiperParcoursUsager
]

export function getArticleBreadcrumbLinks(h1: string) {
  return [
    { to: '/', text: 'Accueil' },
    { to: '/articles', text: 'Articles' },
    { text: h1 }
  ]
}

import config from '@siteConfig/config.yaml'

export default config

export const selectedThematiqueDefault = 'Produire'
export const selectedSubThemeDefault = 'Nucléaire'

export const thematiques = [
  'Produire',
  'Se nourrir',
  'Se loger',
  'Se déplacer',
  'Préserver',
  'Consommer',
  'Chantiers transverses'
]

export const subThemes = {
  Produire: [
    'Nucléaire',
    'Tertiaire (incluant les bâtiments publics de l\'État et des collectivités, hors logement)',
    'Production d\'électricité décarbonée (hors nucléaire)',
    'Production d\'énergie décarbonnée (hors éléctricité)',
    'Prévention, gestion et valorisation des déchets',
    'Transport de marchandises, logistique, e-commerce',
    'Verdissement du secteur et des instruments financiers',
    'Décarbonation de l’industrie'
  ],
  'Se nourrir': [
    'Alimentation',
    'Agriculture et pêche'
  ],
  'Se loger': [
    'Construction et rénovation des logements',
    'Aménagements des villes'
  ],
  'Se déplacer': [
    'Voitures et infrastructures routières',
    'Mobilité courte distance (hors voiture)',
    'Mobilité longue distance (avion, train)'
  ],
  'Préserver': [
    'Eau',
    'Sols',
    'Océans et mers',
    'Forêt'
  ],
  'Consommer': [
    'Consommation plus durable (ménages)',
    'Numérique responsable',
    'Achats durables (de l’État, des collectivités et des entreprises)'
  ],
  'Chantiers transverses': [
    'Le financement qui permet de définir des trajectoires d’investissement crédibles et cohérentes',
    'La planification et la différenciation territoriale selon les caractéristiques et les spécificités de chaque territoire, incluant les territoires ultra-marins',
    'La transition des filières avec la gestion des emplois, des formations et des compétences',
    'Les données environnementales',
    'Les services publics exemplaires',
    'La transition juste et les mesures d’accompagnement, pour ne laisser personne au bord du chemin',
    'La sobriété des usages et des ressources'
  ]
}

export const defaultOptions = {
  'Produire': 'Nucléaire',
  'Se nourrir': 'Alimentation',
  'Se loger': 'Construction et rénovation des logements',
  'Se déplacer': 'Voitures et infrastructures routières',
  'Préserver': 'Eau',
  'Consommer': 'Consommation plus durable (ménages)',
  'Chantiers transverses': 'Le financement qui permet de définir des trajectoires d’investissement crédibles et cohérentes'
}

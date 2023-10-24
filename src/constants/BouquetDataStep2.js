export const thematiques = [
  'Produire',
  'Se nourrir',
  'Se loger',
  'Se déplacer',
  'Préserver',
  'Consommer',
  'Chantiers transverses'
]

export const getOptions = (selectSubtheme) => {
 switch (selectSubtheme) {
   case 'Produire':
     return [
       'Nucléaire',
       'Tertiaire (incluant les bâtiments publics de l\'État et des collectivités, hors logement)',
       'Production d\'électricité décarbonée (hors nucléaire)',
       'Production d\'énergie décarbonnée (hors éléctricité)',
       'Prévention, gestion et valorisation des déchets',
       'Transport de marchandises, logistique, e-commerce',
       'Verdissement du secteur et des instruments financiers',
       'Décarbonation de l’industrie',
     ];
   case 'Se nourrir':
     return [
       'Alimentation',
       'Agriculture et pêche'
     ];
   case 'Se loger':
     return [
       'Construction et rénovation des logements',
       'Aménagements des villes'
     ];
   case 'Se déplacer':
     return [
       'Voitures et infrastructures routières',
       'Mobilité courte distance (hors voiture)',
       'Mobilité longue distance (avion, train)'
     ];
   case 'Préserver':
     return [
       'Eau',
       'Sols',
       'Océans et mers',
       'Forêt'
     ];
   case 'Consommer':
     return [
       'Consommation plus durable (ménages)',
       'Numérique responsable',
       'Achats durables (de l’État, des collectivités et des entreprises)'
     ];
   case 'Chantiers transverses':
     return [
       'Le financement qui permet de définir des trajectoires d’investissement crédibles et cohérentes',
       'La planification et la différenciation territoriale selon les caractéristiques et les spécificités de chaque territoire, incluant les territoires ultra-marins',
       'La transition des filières avec la gestion des emplois, des formations et des compétences',
       'Les données environnementales',
       'Les services publics exemplaires',
       'La transition juste et les mesures d’accompagnement, pour ne laisser personne au bord du chemin',
       'La sobriété des usages et des ressources'
     ];
   default:
     return [];
 }
}

export const getOptionDefault = (theme) => {
 switch (theme) {
   case 'Produire':
     return 'Nucléaire'
   case 'Se nourrir':
     return 'Alimentation'
   case 'Se loger':
     return 'Construction et rénovation des logements'
   case 'Se déplacer':
     return 'Voitures et infrastructures routières'
   case 'Préserver':
     return 'Eau'
   case 'Consommer':
     return 'Consommation plus durable (ménages)'
   case 'Chantiers transverses':
     return 'Le financement qui permet de définir des trajectoires d’investissement crédibles et cohérentes'
   default:
     return null
 }
}
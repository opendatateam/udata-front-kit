# Architecture du frontend udata-front-kit

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Arborescence du projet](#arborescence-du-projet)
   - [Répertoires principaux](#répertoires-principaux)
   - [Personnalisations via `/src/custom`](#personnalisations-via-srccustom)
   - [Configurations via `/configs`](#configurations-via-configs)
3. [Les univers et leur paramétrage](#les-univers-et-leur-paramétrage)
4. [Les filtres et leur configuration](#les-filtres-et-leur-configuration)
5. [Composants DSFR Vue.js – librairie fonctionnelle commune](#composants-dsfr-vuejs--librairie-fonctionnelle-commune)

---

## Vue d'ensemble

`udata-front-kit` est un framework Vue.js permettant de déployer des sites thématiques (appelés **verticales**) basés sur l'écosystème [data.gouv.fr](https://www.data.gouv.fr/) — notamment les données qui y sont cataloguées. Chaque verticale partage le même socle applicatif tout en bénéficiant de sa propre configuration et de ses propres personnalisations.

## Arborescence du projet

### Répertoires principaux

```
.
├── configs/          # Fichiers de configuration YAML par verticale
├── cypress/          # Tests end-to-end
├── doc/              # Documentation
├── public/           # Ressources statiques publiques
├── scripts/          # Scripts utilitaires
└── src/
    ├── components/   # Composants Vue.js partagés
    ├── custom/       # Personnalisations spécifiques par verticale
    ├── model/        # Types TypeScript (modèles de données et config)
    ├── router/       # Configuration du routeur
    ├── services/     # Appels API et services métier
    ├── store/        # Gestion d'état (Pinia)
    ├── utils/        # Fonctions utilitaires
    └── views/        # Vues génériques partagées
```

### Personnalisations via `/src/custom`

Le répertoire `src/custom` contient les personnalisations **propres à chaque verticale**. Seul le code du site actif (défini par `VITE_SITE_ID`) est utilisé au runtime.

```
src/custom/
├── ecospheres/
│   ├── components/   # Composants Vue.js spécifiques à la verticale
│   ├── model/        # Types spécifiques
│   ├── utils/        # Utilitaires spécifiques
│   └── views/        # Vues spécifiques (ex: page d'accueil, indicateurs)
├── meteo-france/
├── defis/
└── ...               # Une entrée par verticale
```

Chaque verticale peut ainsi :

- surcharger la page d'accueil avec sa propre vue (`views/HomeView.vue`)
- ajouter des routes supplémentaires (`routes.ts`)
- définir des composants métier spécifiques (ex. : indicateurs pour Ecosphères)

Tout ce qui n'est pas surchargé est fourni par le socle commun (`src/components`, `src/views`).

> [!NOTE]
> Il est recommandé d'utiliser au maximum les possibilités de configuration du comportent existant avant de définir des composants ou pages _custom_.

### Configurations via `/configs`

Chaque verticale possède un fichier `configs/<site_id>/config.yaml` qui centralise **toute la configuration fonctionnelle** : titre du site, URL de l'API data.gouv.fr, pages disponibles, filtres, univers, etc.

La variable d'environnement `VITE_SITE_ID` détermine quelle configuration est chargée au démarrage.

## Les univers et leur paramétrage

### Paramétrage des pages

Chaque entrée sous `pages` dans `config.yaml` correspond à une page de liste (jeux de données, API, bouquets…). Les principales clés sont :

| Clé              | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `universe_query` | Filtres fixes définissant l'univers (ex. topic, organisation) |
| `filter_prefix`  | Préfixe/namespace pour les valeurs de filtres usager          |
| `title`          | Titre affiché sur la page de liste                            |
| `labels`         | Noms singulier/pluriel de l'objet listé                       |
| `default_sort`   | Tri par défaut                                                |
| `filters`        | Liste des filtres exposés à l'usager (voir section suivante)  |
| `banner`         | Bandeau d'introduction optionnel                              |
| `editable`       | Autorisation d'édition pour les usagers connectés             |

### Notion d'univers

Un **univers** est un sous-ensemble thématique de données exposé sur une page donnée. Il est défini par un paramètre `universe_query` dans la configuration d'une page, qui se traduit en filtres automatiques appliqués à toutes les requêtes de cette page vers l'API data.gouv.fr.

Cette notion d'univers est à mettre en parallèle avec celle du [dépôt de gestion des univers](https://github.com/opendatateam/udata-front-kit-universe/). Celui-ci agit en amont du frontend et permet de rassembler les données d'une thématique dans un topic dédié. Dans ce cas, l'univers du frontend se résume au dit topic.

> [!NOTE]
> Il est possible pour une verticale de définir un univers sans se reposer sur `udata-front-kit-univers` en amont. Par exemple, on peut considférer qu'un tag + une organisation constititue un univers. Cette contrainte sera exprimée dans `universe_query`.

Exemple (extrait de `configs/ecospheres/config.yaml`) :

```yaml
pages:
  datasets:
    universe_query:
      topic: 65e9aa6cb5c809c30c70ee02
    title: Jeux de données
```

Ici, tous les jeux de données affichés sur la page `datasets` sont filtrés par le topic dont l'identifiant est `65e9aa6cb5c809c30c70ee02`. L'usager ne voit sur cette page que les données appartenant à cet univers.

## Les filtres et leur configuration

Les filtres permettent à l'usager d'affiner les résultats d'une page. Ils sont déclarés dans la liste `filters` de chaque page.

### Structure d'un filtre

```yaml
filters:
  - name: Thématique # Libellé affiché
    id: theme # Identifiant unique (parmi tous les filtres de la page)
    type: select # Type de filtre (voir ci-dessous)
    color: green-bourgeon # Couleur de l'étiquette (palette DSFR)
    api_param: tag # Paramètre de l'API correspondant (défaut : "tag")
    use_filter_prefix: true # Préfixe le paramètre avec filter_prefix
    values: # Liste des valeurs possibles
      - id: energie
        name: Énergie
      - id: biodiversite
        name: Biodiversité
```

### Types de filtres disponibles

| Type                  | Description                             |
| --------------------- | --------------------------------------- |
| `select`              | Liste déroulante de valeurs prédéfinies |
| `checkbox`            | Case à cocher (filtre binaire)          |
| `spatial_zone`        | Sélection d'une zone géographique       |
| `spatial_granularity` | Sélection d'une granularité spatiale    |
| `organization`        | Sélection d'une organisation            |

### Options avancées

| Clé              | Description                                                                      |
| ---------------- | -------------------------------------------------------------------------------- |
| `child`          | Identifiant d'un filtre enfant (filtre en cascade)                               |
| `default_option` | Option sélectionnée par défaut                                                   |
| `default_value`  | Valeur par défaut                                                                |
| `authenticated`  | Filtre visible uniquement pour les usagers connectés                             |
| `hide_on_list`   | Masque le filtre sur la page de liste (tout en l'appliquant)                     |
| `parent`         | (sur une valeur) Identifiant de la valeur parente pour les filtres hiérarchiques |

### Exemple détaillé

Pour exemple, la configuration suivante :

```
pages:
  indicators:
    list_all: true
    universe_query:
      topic: 1234
    filter_prefix: ecospheres-indicateurs
    filters:
      - name: Enjeu
        default_option: Tous les enjeux
        id: enjeu
        type: select
        color: blue-ecume
        use_filter_prefix: true
        values:
          - id: adaptation-climat
            name: Adaptation climat
          - id: attenuation-climat
            name: Atténuation climat
          - id: biodiversite
            name: Biodiversité
          - id: ressources
            name: Ressources
          - id: sante
            name: Santé
```

Produira les effets suivants sur la page `indicators` :

- Présence d'un filtre de type `select` sur la page ;
- Au clic sur la valeur "Adaptation climent", génération d'une requête `?tag=ecospheres-indicateurs-enjeu-adaptation-climat&topic=1234` : concaténation de la `universe_query` et d'un tag préfixé.

## Composants DSFR Vue.js – librairie fonctionnelle commune

Le socle commun fournit une bibliothèque de composants Vue.js conformes au [Design Système de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/), organisés par domaine fonctionnel.

### Composants principaux (`src/components`)

| Composant                   | Description                                   |
| --------------------------- | --------------------------------------------- |
| `SearchComponent.vue`       | Barre de recherche avec suggestions           |
| `NavigationComponent.vue`   | Menu de navigation principal                  |
| `FilterSelectComponent.vue` | Filtre de type liste déroulante               |
| `SelectComponent.vue`       | Composant de sélection générique              |
| `CheckboxComponent.vue`     | Filtre de type case à cocher                  |
| `TagComponent.vue`          | Étiquette colorée (thématique, filtre actif…) |
| `OrganizationCard.vue`      | Carte de présentation d'une organisation      |
| `GenericContainer.vue`      | Conteneur de mise en page générique           |
| `NoResults.vue`             | Message d'absence de résultats                |
| `BlankState.vue`            | État vide (page sans contenu)                 |

### Sections de page (`src/components/sections`)

Ces composants structurent les blocs d'une page d'accueil ou d'une page de contenu :

| Composant                | Description                              |
| ------------------------ | ---------------------------------------- |
| `SubSectionDatasets.vue` | Bloc de mise en avant de jeux de données |
| `SubSectionCards.vue`    | Bloc de cartes (organisations, thèmes…)  |
| `SubSectionTiles.vue`    | Bloc de tuiles de navigation             |
| `SubSectionButtons.vue`  | Bloc de boutons d'action                 |

### Composants de jeux de données (`src/components/datasets`)

| Composant                      | Description                                |
| ------------------------------ | ------------------------------------------ |
| `DatasetList.vue`              | Liste paginée de jeux de données           |
| `DatasetInformationPanel.vue`  | Panneau d'informations d'un jeu de données |
| `DatasetSidebar.vue`           | Barre latérale d'un jeu de données         |
| `ResourcesList.vue`            | Liste des ressources d'un jeu de données   |
| `LeafletMap.vue`               | Carte géographique (couverture spatiale)   |
| `ExtendedInformationPanel.vue` | Panneau d'informations étendu              |

### Personnalisation des composants

Une verticale peut remplacer ou étendre tout composant du socle en plaçant une version spécifique dans `src/custom/<site_id>/components/`. Le mécanisme de résolution de Vue privilégie la version locale sur la version commune.

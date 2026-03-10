# Architecture de `udata-front-kit`

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
   - [Répertoires principaux](#répertoires-principaux)
   - [Sources des composants](#sources-des-composants)
2. [Les univers et leur paramétrage](#les-univers-et-leur-paramétrage)
   - [Configuration via `/configs`](#configuration-via-configs)
   - [Paramétrage des pages](#paramétrage-des-pages)
   - [Notion d'univers](#notion-dunivers)
3. [Les filtres et leur configuration](#les-filtres-et-leur-configuration)
   - [Structure d'un filtre](#structure-dun-filtre)
   - [Types de filtres disponibles](#types-de-filtres-disponibles)
   - [Options avancées](#options-avancées)
   - [Exemple détaillé](#exemple-détaillé)
4. [Personnalisation avancée](#personnalisation-avancée)
   - [Personnalisations via `/src/custom`](#personnalisations-via-srccustom)
   - [Routes personnalisées et pages](#routes-personnalisées-et-pages)
   - [Architecture typique d'une page de liste](#architecture-typique-dune-page-de-liste)

## Vue d'ensemble

`udata-front-kit` est un framework Vue.js permettant de déployer des sites thématiques (appelés **verticales**) basés sur l'écosystème [data.gouv.fr](https://www.data.gouv.fr/), et notamment son catalogue de données. Chaque verticale partage le même socle applicatif tout en bénéficiant de sa propre configuration et de ses propres personnalisations.

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

### Sources des composants

Les composants utilisés dans le front-kit proviennent de trois sources :

- **[`@datagouv/components-next`](https://github.com/datagouv/cdata/tree/main/datagouv-components)** : bibliothèque amont maintenue par l'équipe data.gouv.fr. Fournit les cartes de présentation (`DatasetCard`, `DataserviceCard`), les types de données (`DatasetV2`, `Dataservice`…) et des utilitaires comme `toast`.
- **[`vue-dsfr`](https://vue-ds.fr)** : bibliothèque de composants Vue.js conformes au [Design Système de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/). Fournit les briques d'interface génériques (`DsfrBreadcrumb`, `DsfrPagination`, `DsfrButton`…), enregistrées globalement et donc disponibles dans tout composant sans import explicite.
- **`src/components/`** : composants propres au front-kit, conçus pour l'assemblage des pages et la logique métier (recherche, filtres, listes…).

## Les univers et leur paramétrage

### Configuration via `/configs`

Chaque verticale possède un fichier `configs/<site_id>/config.yaml` qui centralise **toute la configuration fonctionnelle** : titre du site, URL de l'API data.gouv.fr, pages disponibles, filtres, univers, etc.

La variable d'environnement `VITE_SITE_ID` détermine quelle configuration est chargée au démarrage.

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

Cette notion d'univers est à mettre en parallèle avec celle du [dépôt de gestion des univers `udata-front-kit-univers`](https://github.com/opendatateam/udata-front-kit-universe/). Celui-ci agit en amont du frontend et permet de rassembler les données d'une thématique dans un topic dédié. Dans ce cas, l'univers du frontend se résume au dit topic.

Exemple (extrait de `configs/ecospheres/config.yaml`) :

```yaml
pages:
  datasets:
    universe_query:
      topic: 65e9aa6cb5c809c30c70ee02
    title: Jeux de données
```

Ici, tous les jeux de données affichés sur la page `datasets` sont filtrés par le topic dont l'identifiant est `65e9aa6cb5c809c30c70ee02`. L'usager ne voit sur cette page que les données appartenant à cet univers.

> [!NOTE]
> Il est possible pour une verticale de définir un univers sans se reposer sur `udata-front-kit-univers` en amont. Par exemple, on peut considérer qu'un tag + une organisation constitue un univers. Cette contrainte sera exprimée dans `universe_query`.

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

```yaml
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

Produira les effets suivants :

- Présence d'un filtre "Enjeu" de type `select` sur la page `indicators`, avec une valeur par défaut "Tous les enjeux" ;
- Au clic sur la valeur "Adaptation climat", génération d'une requête `?tag=ecospheres-indicateurs-enjeu-adaptation-climat&topic=1234` : concaténation de la `universe_query` et d'un tag préfixé.

## Personnalisation avancée

> [!NOTE]
> Il est recommandé d'utiliser au maximum les possibilités de configuration du comportement existant avant de définir des composants ou pages _custom_.

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

### Routes personnalisées et pages

Le routeur principal (`src/router/index.ts`) charge les routes communes (organisations, pages statiques, authentification…). Au démarrage, il charge dynamiquement le fichier `src/custom/<site_id>/routes.ts` de la verticale active et **fusionne** les deux : une route custom ayant le même chemin qu'une route commune la remplace.

Le fichier `routes.ts` d'une verticale s'appuie sur les fonctions utilitaires de `src/router/utils.ts` pour déclarer des pages de liste/détail sans avoir à câbler manuellement toutes les vues. Les principales fonctions disponibles sont :

| Fonction                         | Usage                                                   |
| -------------------------------- | ------------------------------------------------------- |
| `useDatasetSearchPageRoutes`     | Page de liste/détail de jeux de données                 |
| `useDataserviceSearchPageRoutes` | Page de liste/détail d'API                              |
| `useTopicSearchPageRoutes`       | Page de liste/détail de bouquets (topics)               |
| `useTopicAdminPagesRoutes`       | Pages d'administration des bouquets (création, édition) |

Chaque appel prend un `pageKey` qui **doit correspondre à une clé sous `pages` dans `config.yaml`**. C'est ce lien qui permet aux vues génériques de lire la configuration (titre, filtres, univers, labels…) via `useCurrentPageConf()`.

La route peut également recevoir des composants en surcharge, passés en props et injectés dynamiquement par les vues génériques :

| Paramètre              | Rôle                                           |
| ---------------------- | ---------------------------------------------- |
| `cardComponent`        | Carte affichée pour chaque élément de la liste |
| `detailsViewComponent` | Vue de détail d'un élément                     |
| `filtersComponent`     | Panneau de filtres personnalisé                |
| `listComponent`        | Composant de liste entier                      |
| `cardClass`            | Classe CSS appliquée à chaque carte (grille)   |

**Exemple** (extrait de `src/custom/ecospheres/routes.ts`) :

```ts
useDatasetSearchPageRoutes({
  pageKey: 'indicators', // → lit pages.indicators dans config.yaml
  metaTitle: 'Indicateurs',
  cardClass: 'fr-col fr-col-lg-6',
  cardComponent: () => import('./components/indicators/IndicatorCard.vue'),
  detailsViewComponent: () =>
    import('./views/indicators/IndicatorDetailView.vue')
})
```

Ici, les indicateurs réutilisent entièrement l'infrastructure de liste des jeux de données (`DataListView`, filtres, pagination), mais avec une carte et une vue de détail spécifiques.

### Architecture typique d'une page de liste

Toutes les pages de liste (jeux de données, API, bouquets, indicateurs…) partagent la même architecture de composants. La vue générique `DataListView` orchestre l'ensemble :

```
DataListView (src/views/data/DataListView.vue)
├── DsfrBreadcrumb          — fil d'Ariane (vue-dsfr)
├── SearchComponent         — barre de recherche textuelle
├── FiltersComponent        — panneau latéral de filtres
│   └── PageFilters         — implémentation par défaut (src/components/pages/PageFilters.vue)
│       ├── FilterSelectComponent   — filtre de type liste déroulante
│       └── CheckboxComponent       — filtre de type case à cocher
└── ListComponent           — liste des résultats
    └── DatasetList (src/components/datasets/DatasetList.vue)  — implémentation par défaut
        ├── SelectComponent     — tri des résultats
        ├── CardComponent       — carte par élément (DatasetCard par défaut, @datagouv/components-next)
        ├── DsfrPagination      — pagination (vue-dsfr)
        └── NoResults           — message si aucun résultat
```

`FiltersComponent` et `CardComponent` (et d'autres) sont **injectés dynamiquement** depuis la méta-donnée de la route. Une verticale peut ainsi remplacer uniquement la carte ou le panneau de filtres sans toucher au reste de l'infrastructure — soit via les paramètres de route (`cardComponent`, `filtersComponent`…), soit en définissant des composants dans `src/custom/<site_id>/components/`.

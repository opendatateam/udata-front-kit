# Architecture de `udata-front-kit`

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
   - [Répertoires principaux](#répertoires-principaux)
   - [Configuration via `/configs`](#configuration-via-configs)
   - [Sources des composants](#sources-des-composants)
2. [Les univers et leur paramétrage](#les-univers-et-leur-paramétrage)
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
├── configs/          # Fichiers de configuration, 1 fichier YAML par verticale
├── cypress/          # Tests end-to-end
├── doc/              # Documentation générale
├── public/           # Ensemble des ressources publiques, dont les pages statiques de chaque verticale
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

### Configuration via `/configs`

Chaque verticale possède un fichier `configs/<site_id>/config.yaml` qui centralise **toute la configuration fonctionnelle** : titre du site, URL de l'API data.gouv.fr, pages disponibles, filtres, univers, etc. Ce fichier YAML est classé dans un sous-dossier au nom de la verticale (`<site_id>`).

La variable d'environnement `VITE_SITE_ID` détermine quelle configuration est chargée au démarrage.

### Sources des composants

Les composants utilisés dans le front-kit proviennent de trois sources :

- **[`@datagouv/components-next`](https://github.com/datagouv/cdata/tree/main/datagouv-components)** : bibliothèque amont maintenue par l'équipe data.gouv.fr. Fournit le composant de recherche unifiée (`GlobalSearch`), les cartes de présentation (`DatasetCard`, `DataserviceCard`), les types de données (`DatasetV2`, `Dataservice`…) et des utilitaires comme `toast`.
- **[`vue-dsfr`](https://vue-ds.fr)** : bibliothèque de composants Vue.js conformes au [Design Système de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/). Fournit les briques d'interface génériques (`DsfrBreadcrumb`, `DsfrPagination`, `DsfrButton`…), enregistrées globalement et donc disponibles dans tout composant sans import explicite.
- **`src/components/`** : composants propres au front-kit, conçus pour l'assemblage des pages et la logique métier (recherche, filtres, listes…).

## Les univers et leur paramétrage

### Paramétrage des pages

Chaque entrée sous `pages` dans `config.yaml` correspond à une page de liste (jeux de données, API, collections…). Les principales clés sont :

| Clé                | Description                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `object_type`      | Type d'objet de la page : `datasets`, `dataservices` ou `topics` (requis)                                           |
| `universe_query`   | Filtres fixes définissant l'univers (ex. topic, organisation)                                                       |
| `filter_prefix`    | Préfixe/namespace pour les valeurs de filtres usager                                                                |
| `title`            | Titre affiché sur la page de liste                                                                                  |
| `breadcrumb_title` | Titre alternatif pour le fil d'Ariane et le sélecteur de type                                                       |
| `labels`           | Noms singulier/pluriel de l'objet listé                                                                             |
| `search`           | Paramétrage de la barre de recherche (`input` : titre au-dessus, `placeholder` : texte du champ)                    |
| `default_sort`     | Tri par défaut                                                                                                      |
| `filters`          | Liste des filtres exposés à l'usager (voir [Les filtres et leur configuration](#les-filtres-et-leur-configuration)) |
| `banner`           | Bandeau d'introduction optionnel                                                                                    |
| `editable`         | Autorisation d'édition pour les usagers connectés                                                                   |

### Notion d'univers

Un **univers** est un sous-ensemble thématique de données exposé sur une page donnée. Il est défini par un paramètre `universe_query` dans la configuration d'une page, qui se traduit en filtres automatiques appliqués à toutes les requêtes de cette page vers l'API data.gouv.fr.

Il existe deux façons de définir un univers :

#### 1. Via un topic géré par `udata-front-kit-universe`

Le [dépôt `udata-front-kit-universe`](https://github.com/opendatateam/udata-front-kit-universe/) fournit un script de gestion qui agit en amont du frontend : il rassemble les données d'une thématique dans un topic dédié sur data.gouv.fr. L'univers se résume alors à ce topic, référencé par son identifiant dans `universe_query`.

```yaml
pages:
  datasets:
    object_type: datasets
    universe_query:
      topic: 65e9aa6cb5c809c30c70ee02
    title: Jeux de données
```

#### 2. Via une requête arbitraire sur les métadonnées existantes

Il est aussi possible de définir un univers directement à partir de métadonnées déjà présentes dans le catalogue, sans recourir au script de gestion. Par exemple, une combinaison tag + organisation peut constituer un univers :

```yaml
pages:
  datasets:
    object_type: datasets
    universe_query:
      tag: energie
      organization: 534fff75a3a7292c64a77e5f
    title: Jeux de données énergie
```

Dans les deux cas, l'usager ne voit sur la page `/datasets` que les données appartenant à l'univers défini.

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

Les filtres se répartissent en deux catégories selon la façon dont ils sont traités :

**Filtres intégrés** — gérés nativement par `GlobalSearch` ; il suffit de déclarer leur `type` dans la liste `filters`. Le type correspond à une clé de filtre API exposée par `GlobalSearch` (`BuiltInFilterKey` dans `@datagouv/components-next`). Par exemple :

| Type                | Description                             |
| ------------------- | --------------------------------------- |
| `badge`             | Filtre par badge (ex. `hvq`)            |
| `last_update_range` | Filtre par date de dernière mise à jour |
| `...`               | ...                                     |

**Filtres personnalisés** — rendus via un slot dédié de `GlobalSearch` et câblés par le front-kit :

| Type                  | Description                             |
| --------------------- | --------------------------------------- |
| `select`              | Liste déroulante de valeurs prédéfinies |
| `organization_custom` | Sélection d'une organisation            |

Le filtre `organization_custom` ne déclare pas de `values` : la liste des organisations est chargée dynamiquement depuis l'URL configurée sous `organizations.<pageKey>` dans `config.yaml`. On peut ainsi filtrer la liste des organisations par rapport à l'univers du site, vs le filtre natif `organization` de data.gouv.fr qui travaille sur toutes les organisations.

### Options avancées

| Clé                | Description                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `default_option`   | Option sélectionnée par défaut                                                                             |
| `default_value`    | Valeur par défaut                                                                                          |
| `advanced`         | Place le filtre dans la section "Filtres avancés" de `GlobalSearch`                                        |
| `applies_to_pages` | Indique les pages pour lesquelles le filtre est partagé (valeur de filtre conservée au changement de page) |
| `hide_on_list`     | Masque le filtre sur la page de liste (tout en l'appliquant)                                               |

### Exemple détaillé

Pour exemple, la configuration suivante :

```yaml
pages:
  indicators:
    object_type: datasets
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

| Fonction                    | Usage                                                      |
| --------------------------- | ---------------------------------------------------------- |
| `useGlobalSearchPageRoutes` | Page de liste/détail (tous types : datasets, API, topics)  |
| `useTopicAdminPagesRoutes`  | Pages d'administration des collections (création, édition) |

Chaque appel prend un `pageKey` qui **doit correspondre à une clé sous `pages` dans `config.yaml`**. Le type d'objet (`datasets`, `dataservices`, `topics`) est lu depuis la clé `object_type` de la page. C'est ce lien qui permet à `UnifiedSearchView` de lire la configuration (titre, filtres, univers, labels…) via `useCurrentPageConf()`.

La route peut également recevoir des composants en surcharge :

| Paramètre              | Rôle                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `cardComponent`        | Carte par défaut pour le type d'objet de la page                    |
| `datasetCardComponent` | Carte pour les jeux de données (dans les pages dataservices/topics) |
| `descriptionComponent` | Composant de description dans la vue de détail                      |
| `detailsViewComponent` | Vue de détail d'un élément                                          |
| `topicConf`            | Options de configuration propres aux pages de topics                |

**Exemple** (extrait de `src/custom/ecospheres/routes.ts`) :

```ts
useGlobalSearchPageRoutes({
  pageKey: 'indicators', // → lit pages.indicators dans config.yaml
  cardComponent: () => import('./components/indicators/IndicatorCard.vue'),
  detailsViewComponent: () =>
    import('./views/indicators/IndicatorDetailView.vue')
})
```

Ici, les indicateurs réutilisent entièrement l'infrastructure de `UnifiedSearchView` et de `GlobalSearch`, mais avec une carte et une vue de détail spécifiques.

### Architecture typique d'une page de liste

Toutes les pages de liste (jeux de données, API, collections, indicateurs…) partagent la même architecture de composants. La vue générique `UnifiedSearchView` orchestre l'ensemble autour du composant `GlobalSearch` de `@datagouv/components-next` :

```
UnifiedSearchView (src/views/UnifiedSearchView.vue)
├── DsfrBreadcrumb              — fil d'Ariane (vue-dsfr)
├── Banner (optionnel)          — bandeau d'introduction
└── GlobalSearch                — recherche unifiée (@datagouv/components-next)
    ├── #custom-filters-top     — slot : filtres personnalisés (select, organization_custom)
    │   ├── SearchSelectFilter          (src/components/search/SearchSelectFilter.vue)
    │   └── SearchOrganizationFilter    (src/components/search/SearchOrganizationFilter.vue)
    └── Slots de carte (#dataset, #dataservice, #topic)
        └── CardComponent       — carte par élément, injectée depuis la méta-route
```

`CardComponent` est **injecté dynamiquement** depuis la méta-donnée de la route. Une verticale peut ainsi remplacer uniquement la carte sans toucher au reste de l'infrastructure, via le paramètre `cardComponent` de `useGlobalSearchPageRoutes`.

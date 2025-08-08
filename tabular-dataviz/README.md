# @ecolabdata/tabular-dataviz

Module de visualisation interactif pour les indicateurs environnementaux de data.gouv.fr

## Installation

```bash
npm install @ecolabdata/tabular-dataviz chart.js
```

## Utilisation

### Import ES Module

```javascript
import { initializeVisualization } from '@ecolabdata/tabular-dataviz'
import '@ecolabdata/tabular-dataviz/styles/visualisation.css'

// Initialiser toutes les visualisations de la page
initializeVisualization()
```

### Configuration

Le module recherche automatiquement les éléments avec la classe `indicator-viz` et initialise les visualisations selon les données fournies via les attributs `data-*`.

```html
<div
  class="indicator-viz"
  data-indicator-id="67cad6f3b0a47a080da80278"
  data-files="[données encodées]"
  data-indicator="[indicateur encodé]"
  data-tabular-api-url="https://tabular-api.data.gouv.fr"
></div>
```

## Fonctionnalités

Le module permet de visualiser les données des indicateurs avec :

- **Choix de la maille** : nationale, régionale, départementale, inter-communale, communale
- **Choix du territoire** : par exemple Auvergne Rhône-Alpes pour la maille régionale
- **Filtres sur les axes** : représentent les colonnes dans les fichiers CSV
- **Graphique interactif** : courbe simple ou séparée selon les axes de l'indicateur

## Structure des données

### Fichiers

Chaque fichier doit contenir :

- `date_mesure` : datetime qui représente l'année de la donnée (ex: `2018-01-01T00:00:00.000` pour 2018)
- **Colonne géographique** : `geocode_region`, `geocode_dpt`, `geocode_departement`, `geocode_epci` ou `geocode_com`
  > Pour la maille nationale, pas besoin de colonne géographique
- **Colonne de valeur principale** : la valeur à visualiser
- **Colonnes des axes** : dimensions de l'indicateur

### Meta-données des fichiers

Disponibles dans `file.extras['ecospheres-indicateurs']` :

```json
{
  "maille": "region",
  "value-column": "emission_co2",
  "axes": {
    "secteur": ["tertiaire", "industrie"],
    "type_energie": ["electricité", "charbon"]
  }
}
```

- `maille` : `fr`, `region`, `departement`, `epci` ou `commune`
- `value-column` : nom de la colonne contenant la valeur principale
- `axes` : objet avec les noms des colonnes des axes

Seules les clés de l'objet `axes` sont utilisées par le module. On lui passe donc une simple liste des clés.

```json
{
  "maille": "region",
  "value-column": "emission_co2",
  "axes": ["secteur", "type_energie"]
}
```

### Meta-données de l'indicateur

Disponibles dans `indicator.extras['ecospheres-indicateurs']` :

```json
{
  "unite": "tonnes CO₂",
  "summable": true,
  "enable_visualization": true
}
```

- `unite` : texte représentant l'unité (ex: `%`, `tonnes`)
- `summable` : booléen indiquant si les valeurs sont sommables
- `enable_visualization` : booléen pour activer/désactiver la visualisation

## Attributs HTML

- `data-indicator-id` : ID de l'indicateur à visualiser
- `data-files` : liste des fichiers encodée avec `encodeURIComponent(JSON.stringify(files))`
- `data-indicator` : objet indicateur encodé avec `encodeURIComponent(JSON.stringify(indicator))`
- `data-tabular-api-url` : URL de l'API tabular (optionnel, par défaut `https://tabular-api.data.gouv.fr`)

## API

### Fonctions principales

- `initializeVisualization(options)` : Initialise les visualisations de la page
- `makeChart(indicator)` : Crée ou met à jour un graphique
- `fetchData(indicator)` : Récupère les données via l'API tabular

### Utilitaires

- `formatBigNumber(value)` : Formate les grands nombres
- `numberWithCommas(value)` : Ajoute les séparateurs de milliers

## Choix technique

Le module utilise du JavaScript vanilla pour une compatibilité maximale avec différentes plateformes.

L'appel aux données se fait via l'API "tabular" de data.gouv.fr qui permet de faire des requêtes HTTP pour interroger les données de fichiers (l'API transforme la requête HTTP en requête SQL).

Documentation de l'API : https://github.com/datagouv/api-tabular

## Dépendances

- **Chart.js**
- **Choices.js**

## 👥 Auteurs

- Ecolab, Commissariat général au développement durable, Ministère en charge de l&rsquo;environnement.

## 📄 Licence

Ce projet est sous licence MIT.

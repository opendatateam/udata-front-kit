# Visualisation dans ecologie.data.gouv.fr

## Contexte

Ce travail a été réalisé en juin 2025 par Bastien Arnout, développeur freelance à qu'il a été demandé d'ajouter un module de visualisation sur certains indicateurs de ecologie.data.gouv.fr

Ces indicateurs sont ceux poussés par l'ecolab via un dépôt de fichiers dans data.gouv.fr

Il a été demandé de pouvoir visualiser les données des fichiers des indicateurs dans un module, avec :

- le choix de la maille (nationale, régionale, départementale, inter-communale, communable)
- le choix du territoire (par exemple Auvergne Rhône Alpes pour la maille régionale)
- des filtres sur les axes de l'indicateur (qui représentent des colonnes dans les fichiers csv)
- un graphique avec une courbe simple ou séparée selon les axes de l'indicateur

## Choix technique

Il a été décidé d'utiliser du javascript simple (on peut également dire vanilla, ce qui veut dire sans framework) pour que le module puisse être facilement utilisable sur d'autres sites.

L'appel aux données se fait via l'api "tabular" de data.gouv.fr qui permet de faire des requêtes http pour requêter les données de fichiers (l'API transforme la requête http en requête SQL). La documentation de l'API est ici : https://github.com/datagouv/api-tabular

Elle permet de faire des requêtes SQL simples, qui sont suffisantes pour notre cas d'usage.

## Structure des fichiers et des meta données

Le module de visualisation repose sur des normes pour structure les fichiers et les meta données. Si ces normes ne sont pas respectées, le module n'apparaitra pas.

### Les fichiers

Il faut déposer un fichier par maille disponible pour l'indicateur.

Chaque fichier doit contenir une colonne `date_mesure` qui contient une datetime qui représente l'année de la donnée, par exemple `2018-01-01T00:00:00.000` pour `2018`

Chaque fichier doit contenir une colonne avec le code géographique du territoire de la maille, ces colonnes peuvent-être : `geocode_region`, `geocode_dpt`, `geocode_departement`, `geocode_epci` et `geocode_com`.

> Pour la maille nationale, le fichier n'a pas besoin de contenir une colonne avec le code géographique.

Le fichier doit contenir une colonne avec la valeur principale, et une colonne par axe de l'indicateur.

### Les meta-données

#### 1) meta-données des fichiers

Les fichiers contiennent des meta-données, disponibles dans `file.extras['ecospheres-indicateurs']`, il faut renseigner ici :

- `maille` : la maille du fichier, soit `fr`, `region`, `dpt`, `epci` ou `com`
- `value-column` : le nom de la colonne qui contient la valeur principale
- `axes` : un objet dont les clefs sont les noms des colonnes des axes, par exemple `{'secteur': ['tertiaire', 'industrie'], 'type_energie': ['electricité', 'charbon']}`

> A noter pour les axes : seulement les clefs de l'objet (nom des colonnes) sont utilisées dans le module. Le module affiche les valeurs disponibles des axes selon les valeurs réelles du fichier après la requête des données.

#### 2) meta-données de l'indicateur

L'indicateur contient également des meta-données, disponibles dans `indicator.extras['ecospheres-indicateurs']`, il faut renseigner ici :

- `unite` : le texte qui représente l'unité de l'indicateur (comme `%` ou `tonnes`)
- `summable` : un booléen qui représente si oui ou non les valeurs de l'indicateur sont sommables. C'est souvent le cas sauf pour les indicateurs construits avec une division (par exemple `taux de motorisation pour 1000 personnes`)
- `enable_visualization` : un boolean qui représente si oui ou non on veut afficher la visualisation pour cet indicateur. Si non, le code du module ne sera pas executé.

## Utilisation

Pour afficher le module sur une plateforme, il faut ajouter une `<div class="indicator-viz">` dans la page HTMl, là où on veut afficher le module.

Il faut également importer dans le header html de la page où s'affiche le module :

- le fichier `visualisation/index.mjs`, ce fichier est un module javascript, il va importer les autres fichiers qu'il utilise et les mettre dans le cache du navigateur.
- le fichier `choices/choices.min.js`, une librairie (https://github.com/jshjohnson/Choices#readme) qui permet d'utiliser un select avec une barre de recherche
- le fichier `choices/chioces.min.css` et `visualisation/visualisation/css` pour les règles de style.

La `<div>` doit également contenir des attributs `custom`, de la forme `data-*` (https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes), ces attributs sont :

- `data-indicator-id` : l'ID de l'indicateur a visualisé
- `data-files`: la liste des fichiers de l'indicateur, chaque fichier doit contenir les attributs `mesh`, `valueColumn` et `axes` (décrits plus haut), il faut utiliser `encodeURIComponent(JSON.stringify(files))` pour bien formatter la données des fichiers dans l'attribut html.
- `data-indicator`: l'objet qui décrit l'indicateur, il doit contenir `id`, `unite`, `summable`, `enableVisualisation` (décrits plus haut), il faut utiliser `encodeURIComponent(JSON.stringify(indicator))` pour bien formatter la données de l'indicateur dans l'attribut html.

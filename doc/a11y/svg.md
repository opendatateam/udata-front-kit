# Fichiers vectoriels .svg

Afin de se conformer au [critère 1.2.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.2.4) du <abbr title="Référentiel général d’amélioration de l’accessibilité">RGAA</abbr>, il convient d'ajouter un attribut `aria-hidden="true"` dans la balise `svg`.

## Points d'attention

- si le fichier `svg` est importé dans le document via une balise `img`, alors il faut ajouter un attribut `alt=""`&nbsp;;
- appliquer cette recommandation uniquement si l'illustration est décorative&nbsp;;
- si l'image est porteuse d'information, il faut au contraire ajouter une alternative textuelle pertinente [(critère 1.1.5)](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1.5).

## Autres recommandations

Optimiser les svg avec [svgo](https://github.com/svg/svgo) ou via l'interface graphique [svgomg](https://jakearchibald.github.io/svgomg/).

### Paramètres conseillés

#### activer&nbsp;:

- Style to attributes
- Replace duplicate elements with links
- Remove style elements
- Remove script elements

Vérifier si l'illustration n'est pas "cassée" après activation de ces réglages. Si elle l'est, tenter de corriger à la main dans le code source ou inverser le réglage problématique.

#### désactiver&nbsp;:

- Remove viewBox

## Ressources

- [Contextually Marking up accessible images and SVGs (2021)](https://www.scottohara.me/blog/2019/05/22/contextual-images-svgs-and-a11y.html)

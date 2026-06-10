# Système d'articles Simplifions

Ce dossier contient tous les articles éditoriaux du site. Un article peut appartenir à un **dossier** (thème) ou exister de façon autonome à la racine. La page `/guides` affiche les dossiers et, s'il y en a, les articles racines.

Les URLs des articles sont toutes préfixées par `/guides` :
- Article en dossier : `/guides/<id-dossier>/<id-article>`
- Article racine : `/guides/<id-article>`

## Templates

| Cas | Fichier à copier |
|---|---|
| Article dans un dossier | `_templates/ArticleDansDossier/` (dossier entier) |
| Article sans dossier (racine) | `_templates/ArticleRacine.vue` |

Les deux templates sont identiques côté contenu (mêmes props, même `<ArticleSection>`). Les différences sont dans les **chemins d'import** et les **arguments de `buildSimplifionsArticlePageMeta`** — voir ci-dessous.

## Structure type

```
Articles/
  meta.ts                                   ← métadonnées de la page /guides (à ne pas modifier)
  index.ts                                  ← registre global (dossiers + articles racines)
  _templates/
    ArticleDansDossier/
      index.ts                              ← template : métadonnées du dossier
      MonArticle.vue                        ← template : article dans un dossier
    ArticleRacine.vue                       ← template : article sans dossier
  MonDossier/
    index.ts                                ← métadonnées du dossier
    ArticleMonNom.vue                       ← contenu + métadonnées de l'article
  ArticleMonNomRacine.vue                   ← exemple d'article sans dossier
```

---

## Cas 1 — Article dans un dossier

**Point de départ** : copier le dossier `_templates/ArticleDansDossier/` et renommer le dossier et les fichiers.

### Fichier 1 : `MonDossier/index.ts`

```ts
export const themeMeta = {
  id: 'mon-dossier',           // slug avec tirets → URL : /guides/mon-dossier
  label: 'Mon dossier',        // kicker affiché dans chaque article du dossier
  title: 'Titre du dossier',   // affiché dans la page dossier et la tuile /guides
  description: 'Description affichée sous le titre du dossier.',
  children: ['mon-article']    // liste des id des articles du dossier
}
```

### Fichier 2 : `MonDossier/ArticleMonNom.vue`

Le fichier utilise deux blocs `<script>` : le premier exporte les métadonnées (lisibles par les autres fichiers), le second contient la logique Vue.

Les sections du sommaire latéral se déclarent directement dans le template avec `<ArticleSection>` — pas de tableau `sections` à maintenir à la main.

```vue
<template>
  <SimplifionsArticleLayout
    :h1="article.h1"
    :title="article.title"
    :lead="article.description"
    :kicker="articleKicker"
    :article-tags="article.articleTags"
    :article-category="article.articleCategory"
    :show-no-development-badge="article.showNoDevelopmentBadge"
    :breadcrumb-links="breadcrumbLinks"
    :hero-backdrop-gradient="article.heroBackdropGradient"
    :hero-panel-background="article.heroPanelBackground"
  >
    <ArticleSection id="premiere-section" label="Première section">
      <p>Contenu de la section.</p>
    </ArticleSection>

    <ArticleSection id="deuxieme-section" label="Deuxième section">
      <!-- Si le titre dans l'article doit être plus long que le label du sommaire : -->
      <!-- <template #heading>Titre long de la deuxième section</template> -->
      <p>Contenu de la deuxième section.</p>
    </ArticleSection>
  </SimplifionsArticleLayout>
</template>

<script lang="ts">
export const articleMeta = {
  id: 'mon-article',                       // → URL : /guides/mon-dossier/mon-article
  h1: "Titre de l'article",
  // title: 'Titre SEO (optionnel, fallback sur h1)',
  description: 'Résumé affiché dans la carte et le bandeau hero.',

  heroBackdropGradient: 'linear-gradient(135deg, #1b1b35 0%, #1e1e1e 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)',

  // --- Optionnel ---
  // imageSrc: '/static/simplifions/assets/mon-image.jpg',
  // articleCategory: 'guide' as const,   // 'guide' | 'liste' | 'palmares' | 'veille'
  // showNoDevelopmentBadge: true,
  // articleTags: [{ label: 'Mon public' }, { label: 'Autre public', href: '/solutions?audience=xxx' }]
} as const
</script>

<script setup lang="ts">
import SimplifionsArticleLayout from '../../../../components/article/SimplifionsArticleLayout.vue'
import ArticleSection from '../../../../components/article/SimplifionsArticleSection.vue'
import { buildSimplifionsArticlePageMeta } from '../../../../model/articles'
import { guidesMeta } from '../../meta'
import { themeMeta } from './index'

const { article, articleKicker, breadcrumbLinks } = buildSimplifionsArticlePageMeta(
  themeMeta,
  articleMeta,
  [{ to: `/${guidesMeta.id}`, text: guidesMeta.title }],
  `/${guidesMeta.id}`
)
</script>
```

> **Important** : importer `guidesMeta` depuis `'../../meta'` (et non `'../../index'`) pour éviter une dépendance circulaire.

### Fichier 3 : `Articles/index.ts`

Ajouter l'entrée dans `folders`.

```ts
import { articleMeta as monArticleMeta } from './MonDossier/ArticleMonNom.vue'
import { themeMeta as monDossierMeta } from './MonDossier'

const parentPath = `/${guidesMeta.id}`   // déjà défini dans le fichier

export const folders = [
  // ... dossiers existants ...
  {
    meta: monDossierMeta,
    articles: [buildSimplifionsArticleCard(monDossierMeta, monArticleMeta, parentPath)]
  }
]
```

### Fichier 4 : `routes.ts`

```ts
import { articleMeta as monArticleMeta } from './views/Articles/MonDossier/ArticleMonNom.vue'
import { themeMeta as monDossierMeta } from './views/Articles/MonDossier'

// Dans routes[] :
buildArticleFolderRoute(
  monDossierMeta,
  [buildSimplifionsArticleCard(monDossierMeta, monArticleMeta, `/${guidesMeta.id}`)],
  [{ meta: monArticleMeta, component: async () => await import('./views/Articles/MonDossier/ArticleMonNom.vue') }]
)
```

`buildArticleFolderRoute` génère deux routes :
- `/guides/<id-dossier>` → page liste du dossier
- `/guides/<id-dossier>/<id-article>` → page de l'article

---

## Cas 2 — Article sans dossier (racine)

**Point de départ** : copier `_templates/ArticleRacine.vue` et le renommer en `ArticleMonNom.vue`.

Les différences avec un article en dossier sont dans le bloc `<script setup>` uniquement :

```vue
<script setup lang="ts">
// Imports en '../../../' (un niveau moins profond qu'un article en dossier)
import SimplifionsArticleLayout from '../../../components/article/SimplifionsArticleLayout.vue'
import ArticleSection from '../../../components/article/SimplifionsArticleSection.vue'
import { buildSimplifionsArticlePageMeta } from '../../../model/articles'
import { guidesMeta } from './meta'

const { article, articleKicker, breadcrumbLinks } = buildSimplifionsArticlePageMeta(
  null,        // ← null : pas de themeMeta de dossier
  articleMeta,
  [{ to: `/${guidesMeta.id}`, text: guidesMeta.title }]
  // ← pas de 4e argument : sans dossier, le préfixe n'est pas nécessaire
)
</script>
```

### `Articles/index.ts`

Ajouter dans `rootArticles`.

```ts
import { articleMeta as monArticleRacineMeta } from './ArticleMonNomRacine.vue'

export const rootArticles: SimplifionsArticleCard[] = [
  // ... articles existants ...
  buildSimplifionsArticleCard(null, monArticleRacineMeta, parentPath)
]
```

### `routes.ts`

```ts
import { articleMeta as monArticleRacineMeta } from './views/Articles/ArticleMonNomRacine.vue'

// Dans routes[] :
{
  path: `/${guidesMeta.id}/${monArticleRacineMeta.id}`,
  name: monArticleRacineMeta.id,
  meta: { title: monArticleRacineMeta.title ?? monArticleRacineMeta.h1 },
  component: async () => await import('./views/Articles/ArticleMonNomRacine.vue')
}
```

---

## Le composant ArticleSection

`<ArticleSection>` remplace le couple `<h2 id>` + entrée dans le tableau `sections`. Il s'enregistre automatiquement dans le sommaire latéral via `provide/inject` — pas de code supplémentaire dans `<script setup>`.

```html
<ArticleSection id="mon-id" label="Label du sommaire">
  <!-- Si le titre de l'article doit être différent du label court du sommaire : -->
  <template #heading>Titre complet de la section</template>

  <p>Contenu de la section.</p>
</ArticleSection>
```

| Prop | Description |
|---|---|
| `id` | Identifiant HTML unique, utilisé pour l'ancre et l'intersection observer |
| `label` | Texte affiché dans le sommaire latéral |
| `#heading` (slot) | Titre alternatif rendu dans le `<h2>` si différent de `label` |

---

## Le composant SimplifionsArticleFigure

`<SimplifionsArticleFigure>` encapsule le pattern `<figure>` + `<img>` + `<figcaption>` utilisé pour les captures d'écran dans les articles. Import depuis `components/article/SimplifionsArticleFigure.vue`.

```html
<SimplifionsArticleFigure
  src="/static/simplifions/assets/mon-image.png"
  alt="Description de l'image pour les lecteurs d'écran"
>
  Légende affichée sous l'image.
</SimplifionsArticleFigure>
```

| Prop | Description |
|---|---|
| `src` | Chemin de l'image |
| `alt` | Texte alternatif |
| slot default | Contenu de la légende (peut contenir du HTML, ex. `<a>`) |

---

## Référence des champs `articleMeta`

| Champ | Type | Requis | Description |
|---|---|---|---|
| `id` | `string` | oui | Identifiant unique et segment d'URL de l'article |
| `h1` | `string` | oui | Titre affiché dans la page (peut être long) |
| `title` | `string` | oui | Titre `<title>` HTML — concis, optimisé SEO |
| `description` | `string` | oui | Meta description et résumé hero/carte |
| `heroBackdropGradient` | `string` | oui | Dégradé CSS du bandeau hero |
| `heroPanelBackground` | `string` | oui | Couleur de fond du panneau titre |
| `imageSrc` | `string` | non | Chemin de l'image hero ; fallback = dégradé SVG généré |
| `articleCategory` | `'guide' \| 'liste' \| 'palmares' \| 'veille'` | non | Badge catégorie + pictogramme de la carte |
| `showNoDevelopmentBadge` | `boolean` | non | Badge "Sans développement" |
| `articleTags` | `{ label: string; href?: string }[]` | non | Tags audience dans le hero |

> **Pictogramme de carte** : `articleCategory` détermine automatiquement le pictogramme affiché sur la carte — `catalog` pour `guide`, `document` pour `liste`, `success` pour `palmares`, `document-search` pour `veille`. Sans catégorie, `catalog` est utilisé par défaut.

## Référence des champs `themeMeta` (dossier)

| Champ | Type | Description |
|---|---|---|
| `id` | `string` | Identifiant unique et segment d'URL du dossier |
| `label` | `string` | Kicker affiché dans les articles du dossier |
| `title` | `string` | Titre affiché dans la page dossier et la tuile `/guides` |
| `description` | `string` | Texte affiché sous le titre |
| `children` | `string[]` | Liste des `id` des articles appartenant au dossier |

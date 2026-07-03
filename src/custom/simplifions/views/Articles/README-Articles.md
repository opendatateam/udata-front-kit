# Système d'articles Simplifions

Ce dossier contient tous les articles éditoriaux du site. Un article peut appartenir à un **dossier** (thème) ou exister de façon autonome à la racine. La page `/guides` affiche les dossiers et, s'il y en a, les articles racines.

Les URLs des articles sont toutes préfixées par `/guides` :
- Article en dossier : `/guides/<id-dossier>/<id-article>`
- Article racine : `/guides/<id-article>`

## Conventions

- **Nommage des fichiers** : tous les fichiers articles commencent par `Article` — ex. `ArticleGuideBaseQuestCeQuUneAPI.vue`.
- **Brouillon** : pour qu'un article ne soit pas accessible, commenter son import et sa route dans `routes.ts`, et son entrée dans `index.ts`.
- **Point de départ** : copier un article existant de même type, renommer le fichier et l'`id` dans `articleMeta`. Les articles `GuidesBases/ArticleGuideBaseQuestCeQuUneAPI.vue` (en dossier) et `ArticleChronologieJuridiqueDLNUF.vue` (racine) servent de référence.

## Structure type

```
Articles/
  meta.ts                                   ← métadonnées de la page /guides (à ne pas modifier)
  index.ts                                  ← registre global (dossiers + articles racines)
  MonDossier/
    index.ts                                ← métadonnées du dossier
    ArticleMonNom.vue                       ← contenu + métadonnées de l'article
  ArticleMonNomRacine.vue                   ← article sans dossier
```

---

## Cas 1 — Article dans un dossier

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
      <!-- <template #heading>Titre long si différent du label sommaire</template> -->
      <p>Contenu de la deuxième section.</p>
    </ArticleSection>
  </SimplifionsArticleLayout>
</template>

<script lang="ts">
export const articleMeta = {
  id: 'mon-article',
  h1: "Titre de l'article",
  title: 'Titre SEO — concis et optimisé pour les moteurs de recherche',
  description: 'Résumé affiché dans la carte et le bandeau hero.',
  heroBackdropGradient: 'linear-gradient(135deg, #1b1b35 0%, #1e1e1e 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)',
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
  // ← pas de 4e argument sans dossier
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

## Snippets de composants

Tous les composants ci-dessous s'utilisent à l'intérieur d'un `<ArticleSection>`. Les imports optionnels se placent dans le bloc `<script setup>`.

### Callout bordure verte

Aucun import requis.

```html
<div class="fr-callout fr-callout--green-menthe fr-my-4w">
  <p class="fr-callout__title">Titre optionnel</p>
  <p class="fr-callout__text">
    Texte du callout. Met en avant une information importante ou un point clé.
  </p>
</div>
```

### Spotlight — 1 solution ou cas d'usage

Carte + commentaire côte à côte. Import requis.

```html
<SimplifionsArticleTopicSpotlight :slugs="['mon-slug']" page-key="solutions">
  <p>Commentaire éditorial sur cette solution.</p>
  <router-link class="fr-btn fr-btn--sm fr-btn--secondary" to="/solutions/mon-slug">
    Voir la fiche complète
  </router-link>
</SimplifionsArticleTopicSpotlight>
```

```ts
import SimplifionsArticleTopicSpotlight from '../../../components/article/SimplifionsArticleTopicSpotlight.vue'
```

Props disponibles (valeur par défaut entre parenthèses) :

| Prop | Défaut | Description |
|---|---|---|
| `:show-description` | `false` | Affiche la description |
| `:show-image` | `true` | Affiche l'image |
| `:show-operateur-tag` | `true` | Badge fournisseur |
| `:show-target-users` | `false` | Tags "à destination de" |
| `:show-fournisseurs` | `false` | Tags fournisseurs de données |
| `:show-simplification-tags` | `false` | Tags de simplification |
| `:show-categorie-de-solution` | `false` | Catégorie de solution |
| `:show-arrow` | `false` | Flèche de navigation |

### Spotlight — plusieurs slugs

Commentaire en haut, cartes en grille en dessous.

```html
<SimplifionsArticleTopicSpotlight
  :slugs="['slug-1', 'slug-2', 'slug-3']"
  page-key="solutions"
>
  <p>Commentaire s'appliquant aux solutions présentées ci-dessous.</p>
</SimplifionsArticleTopicSpotlight>
```

### Figure / capture d'écran

Import requis.

```html
<SimplifionsArticleFigure
  src="/static/simplifions/assets/mon-image.png"
  alt="Description de l'image"
>
  Légende affichée sous l'image (peut contenir du HTML, ex. <a href="#section">lien</a>).
</SimplifionsArticleFigure>
```

```ts
import SimplifionsArticleFigure from '../../../components/article/SimplifionsArticleFigure.vue'
```

### Timeline

Chronologie verticale. Import requis.

```html
<SimplifionsArticleTimeline>
  <li>
    <time datetime="2024">2024</time>
    <span class="timeline-tag">Loi</span>
    <p><strong>Titre de l'événement</strong> — Description de l'événement.</p>
    <a href="https://..." target="_blank" rel="noopener noreferrer"
       class="fr-link fr-link--icon-right fr-icon-external-link-line">
      Lien source<span class="fr-sr-only"> (ouvre une nouvelle fenêtre)</span>
    </a>
  </li>
</SimplifionsArticleTimeline>
```

```ts
import SimplifionsArticleTimeline from '../../../components/article/SimplifionsArticleTimeline.vue'
```

Classes disponibles sur `<span class="timeline-tag">` :

| Classe | Apparence |
|---|---|
| _(défaut)_ | Badge bleu |
| `timeline-tag--eu` | Badge violet (contexte européen) |
| `timeline-tag--rapport` | Badge beige (rapport / publication) |

### Checklist

Liste de points récapitulatifs, fond beige, icône verte. Aucun import requis.

```html
<SimplifionsArticleChecklist>
  <li>Premier point à vérifier.</li>
  <li>
    Deuxième point avec un
    <router-link class="fr-link" to="/solutions/mon-slug">lien interne</router-link>.
  </li>
  <li>Troisième point.</li>
</SimplifionsArticleChecklist>
```

### Bouton centré

Aucun import requis.

```html
<div class="fr-grid-row fr-grid-row--center fr-mt-3w">
  <router-link
    class="fr-btn fr-btn--secondary fr-icon-arrow-right-line fr-btn--icon-right"
    to="/ma-page"
  >
    Texte du bouton
  </router-link>
</div>
```

### Grille de cartes par slug — Solutions

Grille 3 colonnes avec skeleton pendant le chargement. Imports et composables requis.

```html
<div class="fr-grid-row fr-grid-row--gutters">
  <template v-if="solutionsLoading">
    <div v-for="n in 3" :key="n" class="fr-col-12 fr-col-lg-4">
      <div class="fr-card guide-card-skeleton" aria-hidden="true" />
    </div>
  </template>
  <template v-else>
    <div v-for="solution in mesSolutions" :key="solution.id" class="fr-col-12 fr-col-lg-4">
      <SimplifionsSolutionCard
        :topic="solution"
        page-key="solutions"
        :show-description="false"
        :show-fournisseurs="false"
        :show-simplification-tags="false"
      />
    </div>
  </template>
</div>
```

```ts
import { useTopicsBySlug } from '../../../components/article/useTopicsBySlug.ts'
import type { TopicSolution } from '../../../model/topics'
import SimplifionsSolutionCard from '../../../components/SimplifionsSolutionCard.vue'

const { topics: mesSolutions, loading: solutionsLoading } = useTopicsBySlug<TopicSolution>([
  'slug-solution-1', 'slug-solution-2', 'slug-solution-3'
])
```

### Grille de cartes par slug — Cas d'usages

Même pattern, variante pour les cas d'usages.

```html
<div class="fr-grid-row fr-grid-row--gutters">
  <template v-if="casUsagesLoading">
    <div v-for="n in 3" :key="n" class="fr-col-12 fr-col-lg-4">
      <div class="fr-card guide-card-skeleton" aria-hidden="true" />
    </div>
  </template>
  <template v-else>
    <div v-for="cu in mesCasUsages" :key="cu.id" class="fr-col-12 fr-col-lg-4">
      <SimplifionsCasDusageCard
        :topic="cu"
        page-key="cas-d-usages"
        :show-description="false"
        :show-fournisseurs="false"
        :show-simplification-tags="false"
      />
    </div>
  </template>
</div>
```

```ts
import { useTopicsBySlug } from '../../../composables/useTopicsBySlug'
import type { TopicCasUsage } from '../../../model/topics'
import SimplifionsCasDusageCard from '../../../components/SimplifionsCasDusageCard.vue'

const { topics: mesCasUsages, loading: casUsagesLoading } = useTopicsBySlug<TopicCasUsage>([
  'slug-cas-usage-1', 'slug-cas-usage-2'
])
```

Style skeleton requis dans `<style scoped>` :

```css
.guide-card-skeleton {
  height: 200px;
  background: var(--background-alt-grey);
  border-radius: var(--radius-default);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

> Ajuster le `3` dans `v-for="n in 3"` selon le nombre de slugs attendus.

---

## Le composant ArticleSection

`<ArticleSection>` s'enregistre automatiquement dans le sommaire latéral via `provide/inject` — pas de code supplémentaire dans `<script setup>`.

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

`<SimplifionsArticleFigure>` encapsule le pattern `<figure>` + `<img>` + `<figcaption>`.

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
| `imageSrc` | `string` | non | Chemin de l'image hero ; sans image = gradient affiché comme fond |
| `articleCategory` | `'guide' \| 'liste' \| 'palmares' \| 'veille'` | non | Badge catégorie + pictogramme de la carte |
| `showNoDevelopmentBadge` | `boolean` | non | Badge "Sans développement" |
| `articleTags` | `{ label: string; href?: string }[]` | non | Tags audience dans le hero |

> **Pictogramme de carte** : `articleCategory` détermine automatiquement le pictogramme — `catalog` pour `guide`, `document` pour `liste`, `success` pour `palmares`, `document-search` pour `veille`. Sans catégorie, `catalog` est utilisé par défaut.

## Référence des champs `themeMeta` (dossier)

| Champ | Type | Description |
|---|---|---|
| `id` | `string` | Identifiant unique et segment d'URL du dossier |
| `label` | `string` | Kicker affiché dans les articles du dossier |
| `title` | `string` | Titre affiché dans la page dossier et la tuile `/guides` |
| `description` | `string` | Texte affiché sous le titre |
| `children` | `string[]` | Liste des `id` des articles appartenant au dossier |

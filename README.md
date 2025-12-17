![udata-front-kit](banner.png)

# udata front kit

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/opendatateam/udata-front-kit/create-deploy-release.yml?branch=main)](https://github.com/opendatateam/udata-front-kit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Kit de développement frontend Vue.js permettant de créer des sites thématiques ("verticales") spécialisés basés sur l'écosystème [data.gouv.fr](https://www.data.gouv.fr/). Ce framework fournit les composants, la configuration et l'architecture nécessaires pour déployer rapidement des verticales dédiées à des domaines spécifiques (écologie, météo, défis, etc.).

## ⚙️ Configuration

Chaque verticale est configurée dans un fichier `config.yaml` stocké sous [`configs/$verticale`](configs).

La variable d'environnement `VITE_SITE_ID` permet de définir la configuration utilisée au lancement de l'application.
Cette variable peut être définie dans le fichier [`.env`](.env) ou ses dérivés.

## 🚀 Développement

### Environnement recommandé

[VSCode](https://code.visualstudio.com/)
\+ [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
\+ [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Installation de pnpm

Ce projet utilise pnpm au lieu de npm. Si vous ne l'avez pas déjà installé :

```sh
# Enable pnpm via Corepack (inclus avec Node.js 20+)
corepack enable pnpm
```

Il existe [d'autres méthodes d'installation si besoin](https://pnpm.io/installation).

### Initialisation du projet

```sh
pnpm install
# vous pouvez ignorer ici les éventuels warnings de type "pnpm approve-builds"

# installe les pre-commit hooks Husky
pnpm run prepare
```

### Commandes de référence

#### Compilation et hot-reload pour le développement

```sh
pnpm run dev
```

#### Compilation et minification pour la production

```sh
pnpm run build
```

#### Tests unitaires via [Vitest](https://vitest.dev/)

```sh
pnpm run test
```

#### Tests end-to-end via [Cypress](https://cypress.io/)

**En environnement de dev** :

Pour lancer les tests _génériques_ communs à tous les sites, qui se trouvent dans `/cypress/e2e/` :

```sh
# Pour lancer la version ligne de commande de cypress :
pnpm run test:e2e

# Pour lancer la version visuelle de cypress :
pnpm run test:e2e:open
```

Pour lancer les tests génériques + les tests spécifiques à site particulier qui se trouvent dans `/cypress/e2e/monsite/` :

```sh
# Pour lancer la version ligne de commande de cypress :
VITE_SITE_ID=monsite pnpm run test:e2e

# Pour lancer un seul test en ligne de commande :
VITE_SITE_ID=monsite pnpm run test:e2e -- --spec cypress/e2e/my/file.cy.js

# Pour lancer la version visuelle de cypress :
VITE_SITE_ID=monsite pnpm run test:e2e:open
```

**Tester un build** :

Dans la CI, on veut lancer les tests sur un build, plutôt que sur un serveur de dev.

```sh
# Build pour monsite
VITE_SITE_ID=monsite pnpm run build
# Run les tests sur le build de monsite
VITE_SITE_ID=monsite pnpm run test:e2e:for_production_build
```

#### Factories pour les tests

Afin de ne pas dépendre de données extérieures pour faire tourner les tests, il est recommandé de "mocker" ou "bouchonner" vos appels APIs.

On utilise la librairie [mimicry-js](https://github.com/Stivooo/mimicry-js) comme factory pour créer des données pour ces mocks.

#### Linting via [ESLint](https://eslint.org/)

```sh
pnpm run lint
```

#### Typage via [TSc](https://www.typescriptlang.org/docs/handbook/compiler-options.html/)

```sh
pnpm run hint
```

#### Code formatting with [Prettier](https://prettier.io/)

```sh
pnpm run format
```

### Pourquoi pnpm ?

Ce projet utilise [pnpm](https://pnpm.io/) au lieu de npm principalement pour des raisons de sécurité :

- bloque par défaut les scripts d'installation des dépendances (sauf Cypress et Husky via `onlyBuiltDependencies`),
- période de cooldown de 4 jours (`minimum-release-age`) avant d'installer les nouveaux packages, laissant le temps à la communauté de détecter les versions malveillantes,
- installation via le lockfile par défaut (`npm ci` like),
- ... et d'autres valeurs de configurations par défaut plus saines que celles de npm.

`pnpm` promet également de meilleurs performances à l'installation et un usage réduit d'espace disque. On ne bénéficie malheureusement pas (encore) de la structure "non-flat" des `node_modules` pour des raisons de rétro-compatibilité avec certaines dépendances.

## 🚢 Déploiement

### 🔍 Déploiement en preview

Une **review app** est un environnement de prévisualisation temporaire qui permet de tester les changements d'une Pull Request dans un environnement similaire à la production. Un workflow CI/CD dédié ([`.github/workflows/review-app.yml`](.github/workflows/review-app.yml)) gère automatiquement la création, mise à jour et suppression de ces environnements.

Les **review apps** ne sont **pas créées automatiquement** lors de l'ouverture d'une Pull Request. L'auteur de la PR doit **déployer manuellement** les PR qu'il souhaite tester, via l'interface de GitHub Actions.

> **💡 Info** : Une fois qu'une review app est créée pour une PR, elle sera **automatiquement mise à jour** à chaque nouveau commit sur la PR.

**URLs générées** : `https://deploy-preview-{PR_NUMBER}--{SITE}.sandbox.data.developpement-durable.gouv.fr`

#### Comment créer une review app

## Solution 1 - par commentaire sur une PR

1. Ecrire un commentaire du type `/deploy {SITE}` dans la PR (e.g. `/deploy ecospheres`)
2. Une emoji 🚀 apparaîtra sous le commentaire pour indiquer que le déploiement est lancé.
3. Une notification du type `@github-actions github-actions bot deployed to ecospheres-preview ` sur le fil de la PR indiquera que le déploiement est terminé, avec un lien vers le déploiement.

## Solution 2 — sur l'interface web de GitHub Actions

1. **Aller dans l'onglet "Actions"** du dépôt GitHub
2. **Sélectionner "Deploy review app"** dans la liste des workflows
3. **Cliquer sur "Run workflow"**
4. **Choisir** :
   - **Branch** : Le nom de la branche à déployer, correspondant à votre PR
   - **Site** : Le site à déployer (dropdown)
   - **Pull Request number** : Le numéro de votre PR
5. **Cliquer sur "Run workflow"**

### 🏭 Déploiement en preprod et en production

Le déploiement des verticales thématiques en preprod et en production s'effectue via un workflow GitHub qui peut être déclenché de deux manières différentes :

#### Comment déployer en préproduction et en production

## Solution 1 - par le message de Git commit

Le déploiement des verticales thématiques en preprod et en production peut s'effectuer via un workflow GitHub qui se déclenche automatiquement à partir du message de commit. Le format du message de commit doit être :

```
[<environment>:<site>:<version_type>] <description>
```

**Paramètres :**

- `<environment>` : Environnement cible (`prod` ou `demo`/`preprod` suivant la verticale)
- `<site>` : Nom du site
  - **Sites disponibles :**
    - `ecospheres` - Site écologie
    - `meteo-france` - Site météo
    - `logistique` - Site logistique
    - `defis` - Site défis
    - `hackathon` - Site hackathon
    - `simplifions` - Site simplifions
- `<version_type>` : Type de version (`major`, `minor`, ou `patch`)

**Exemple :**

```
[prod:ecologie:minor] nouvelle fonctionnalité incroyable
```

Le workflow se déclenche sur tous les push vers toutes les branches, mais ne s'exécute que si le message de commit commence par `[` (condition `startsWith(github.event.head_commit.message, '[')`). Cette condition n'est pas parfaite mais GitHub Actions ne supporte pas directement le déclenchement de workflows basé sur des expressions régulières dans les messages de commit.

Toutes les variables et secrets nécessaires pour ce workflow sont listés dans la section `env:` du [workflow de déploiement](.github/workflows/create-deploy-release.yml).

## Solution 2 — sur l'interface web de GitHub Actions

Le déploiement peut également être déclenché manuellement via l'interface GitHub Actions :

1. **Aller dans l'onglet "Actions"** du dépôt GitHub
2. **Sélectionner "Deployment on datagouv domains with version bump"** dans la liste des workflows
3. **Cliquer sur "Run workflow"**
4. **Choisir** :
   - **Site** : Le site à déployer (dropdown avec les sites disponibles)
   - **Environment** : L'environnement cible (`demo`, `preprod`, ou `prod`)
   - **Version type** : Le type de version (`major`, `minor`, ou `patch`)
5. **Cliquer sur "Run workflow"**

#### Architecture de déploiement en preprod et en production

Pour des raisons de sécurité, le déploiement est effectué par un dépôt privé GitLab dédié à l'infrastructure. Le processus fonctionne ainsi :

1. **GitHub Actions** : Les actions sur GitHub déclenchent le workflow
2. **GitHub Actions** : Calcul de la prochaine version basée sur les tags existants
3. **GitHub Actions** : Création d'un nouveau tag avec cette version. Le tag créé est utilisé lors de la construction de l'image et pendant le déploiement.
4. **GitHub Actions** : Appels à l'API GitLab via un script téléchargé depuis le dépôt "scaffolding"
5. **GitLab CI/CD** : Le script déclenche ensuite le pipeline de déploiement sur GitLab

**Note** : Pour cette raison il n'est pas encore possible de suivre le détail de l'avancement du déploiement directement depuis GitHub Actions (#TODO)

#### Workflow de déploiement recommandé

:warning: Cette section est une recommandation, chaque verticale/site est libre de définir ses propres processus.

- La branche `main` recueille les fonctionnalités au fur et à mesure de leur développement.
- La branche `{site}-preprod` est utilisée pour les déploiements sur <https://{site}.preprod.data.gouv.fr>.
  - On commence par créer une Pull Request depuis `main` vers `{site}-preprod` ;
  - Une fois cette PR validée, on déploie soit via un message de commit normé soit via l'UI GitHub Actions (cf plus haut).
- La branche `{site}-prod` est utilisée pour les déploiements sur <https://{site}.data.gouv.fr>.
  - Même processus que pour la preprod, mais en créant une PR depuis `{site}-preprod` vers `{site})-prod`.

NB : dans certains cas, il possible de créer et de déployer des Pull Requests depuis une _feature branch_ vers `{site}-(pre)prod`, par exemple pour définir une configuration spécifique à l'environnement de preprod ou de prod.

## 📚 Bibliothèques et plugins utilisés

### 📦 Bibliothèques

- `@datagouv/components` - Composants officiels de data.gouv.fr
- `@gouvminint/vue-dsfr` - Intégration Vue.js du Design System de l'État
- `@gouvfr/dsfr` - Design System de l'État Français
- `@vueuse/core` - Utilitaires Vue.js (useTitle, etc.)
  - `@vueuse/integrations` - Intégrations supplémentaires de VueUse (focustrap)
- `unplugin-auto-import` - Auto-import d'API Vue.js et vue-dsfr
- `unplugin-vue-components` - Auto-import des composants custom et vue-dsfr
- `@unhead/vue` - Gestion du SEO et des métadonnées

### 🧹 Formatage et validation du code

- `eslint` - `eslint.config.mjs`
  - `typescript-eslint`
  - `eslint-plugin-json`
  - `eslint-plugin-vue`
- `prettier` - `.prettierrc.mjs`
  - `prettier-plugin-organize-imports` // organise et/ou supprime les imports des fichiers

À chaque `git commit`, `husky` lance `lint-staged` qui formate les fichiers "staged" avec `prettier`.

## Configuration SEO

### sitemap.xml et robots.txt

Le référencement des verticales est géré via la section `website.seo` du fichier de configuration. Cette configuration pilote la génération de `robots.txt` et `sitemap.xml` par le package [`udata-front-kit-seo`](https://github.com/opendatateam/udata-front-kit-seo), qui lit cette configuration et génère les fichiers pour chaque couple site/environnement.

Les clés dans `sitemap_xml` (`topics_pages`, `datasets_pages`, `dataservices_pages`) doivent correspondre aux identifiants définis dans la section `pages:` du fichier de configuration.

Exemple :

```yaml
website:
  seo:
    canonical_url: https://site.data.gouv.fr
    meta:
      keywords: 'mots-clés, séparés, par, virgules'
      description: 'Description du site'
      robots: 'index, follow' # 'noindex, nofollow' pour demo/preprod
    robots_txt:
      disallow: [/admin]
    sitemap_xml:
      topics_pages: [bouquets]
      datasets_pages: [indicators]
```

### Gestion des meta tags dans l'application

- Les meta `robots` sont injectés au niveau du template HTML (`index.html`) lors du build via `vite.config.mts`
- Les meta `keywords` et `description` globaux peuvent être définis dans `website.seo.meta`
- Pour les meta tags dynamiques par page (Open Graph, descriptions spécifiques, etc.), utilisez le composable `useHead` de [`@unhead/vue`](https://unhead.unjs.io/) directement dans vos composants Vue (voir exemples dans `src/custom/*/views/`)
- Le `canonical_url` est utilisé comme base pour les liens canoniques

## Configurer Sentry pour surveiller les erreurs

Après avoir créé votre projet (VueJs) sur sentry, voici la configuration à ajouter à votre fichier de config pour activer Sentry dans votre projet :

```
sentry:
  domain_url: 'https://errors.data.gouv.fr/' # Ou tout autre domaine où vous hébergez votre sentry
  dsn: 'https://c8268303ac0799edda45ced7faa7e0a0@errors.data.gouv.fr/38' # Vous trouverez ce DSN lors de l'initialisation de votre projet dans Sentry
  environment: 'preprod' # Ou autre (par exemple 'production'), selon la branche de déploiement
```

D'autres éléments de configuration sont disponibles dans le fichier [src/model/config.ts](./src/model/config.ts)

## 👥 Auteurs

- data.gouv.fr, Direction interministérielle du numérique.
- Ecolab, Commissariat général au développement durable, Ministère en charge de l&rsquo;environnement.

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE.md) pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/opendatateam/udata-front-kit/issues)
- **Formulaire de contact** : [Formulaire de support](https://support.data.gouv.fr/)

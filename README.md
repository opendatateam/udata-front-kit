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

### Initialisation du projet

```sh
npm clean-install

# installe les pre-commit hooks Husky
npm run prepare
```

### Commandes de référence

#### Compilation et hot-reload pour le développement

```sh
npm run dev
```

#### Compilation et minification pour la production

```sh
npm run build
```

#### Tests unitaires via [Vitest](https://vitest.dev/)

```sh
npm run test
```

#### Tests end-to-end via [Cypress](https://cypress.io/)

**En environnement de dev** :

Pour lancer les tests _génériques_ communs à tous les sites, qui se trouvent dans `/cypress/e2e/` :

```sh
# Pour lancer la version ligne de commande de cypress :
npm run test:e2e

# Pour lancer la version visuelle de cypress :
npm run test:e2e:open
```

Pour lancer les tests génériques + les tests spécifiques à site particulier qui se trouvent dans `/cypress/e2e/monsite/` :

```sh
# Pour lancer la version ligne de commande de cypress :
VITE_SITE_ID=monsite npm run test:e2e

# Pour lancer la version visuelle de cypress :
VITE_SITE_ID=monsite npm run test:e2e:open
```

**Tester un build** :

Dans la CI, on veut lancer les tests sur un build, plutôt que sur un serveur de dev.

```sh
# Build pour monsite
VITE_SITE_ID=monsite npm run build
# Run les tests sur le build de monsite
VITE_SITE_ID=monsite npm run test:e2e:for_production_build
```

#### Linting via [ESLint](https://eslint.org/)

```sh
npm run lint
```

#### Typage via [TSc](https://www.typescriptlang.org/docs/handbook/compiler-options.html/)

```sh
npm run hint
```

#### Code formatting with [Prettier](https://prettier.io/)

```sh
npm run format
```

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

Le déploiement des verticales thématiques en preprod et en production s'effectue via un workflow GitHub qui se déclenche **manuellement** via l'interface GitHub Actions.

Pour déployer une verticale :

1. **Aller dans l'onglet "Actions"** du dépôt GitHub
2. **Sélectionner "Manual deployment with version bump"** dans la liste des workflows
3. **Cliquer sur "Run workflow"**
4. **Choisir** :
   - **Site** : Le site à déployer (dropdown avec les sites disponibles)
   - **Environment** : L'environnement cible (`demo` (preprod for `ecologie`), `preprod` (preprod for all other sites) ou `prod`)
   - **Version type** : Le type de version (`major`, `minor`, ou `patch`)
5. **Cliquer sur "Run workflow"**

Le workflow va automatiquement :
- Calculer la prochaine version basée sur les tags existants
- Créer un nouveau tag avec cette version
- Déclencher le pipeline de déploiement GitLab

**Sites disponibles :**
- `ecospheres` - Site écologie
- `meteo-france` - Site météo
- `logistique` - Site logistique
- `defis` - Site défis
- `hackathon` - Site hackathon
- `simplifions` - Site simplifions

**Exemple de déploiement :**
- Site : `ecospheres`
- Environment : `prod`
- Version type : `minor`
Cela créera une nouvelle version mineure (ex: `ecospheres-prod-1.2.0`) et la déploiera en production.

Toutes les variables et secrets nécessaires pour ce workflow sont listés dans la section `env:` du [workflow de déploiement](.github/workflows/create-deploy-release.yml).

#### Architecture de déploiement en preprod et en production

Pour des raisons de sécurité, le déploiement est effectué par un dépôt privé GitLab dédié à l'infrastructure. Le processus fonctionne en deux temps :

1. **GitHub Actions** : Les commits sur GitHub déclenchent le workflow qui fait des appels à l'API GitLab via un script téléchargé depuis le dépôt "scaffolding"
2. **GitLab CI/CD** : Le script déclenche ensuite le pipeline de déploiement sur GitLab

Plus précisément, le [workflow de déploiement](.github/workflows/create-deploy-release.yml) est responsable de :

1. **Configuration de l'environnement** : variables et accès aux dépôts
2. **Clonage du dépôt "scaffolding" du script d'appel à l'infrastructure**
3. **Récupération de la configuration** basée sur le message de commit
4. **Création et push d'un nouveau tag** selon la partie de version spécifiée
5. **Déclenchement d'un pipeline GitLab CI/CD**

**Note** : Pour cette raison il n'est pas encore possible de suivre le détail de l'avancement du déploiement directement depuis GitHub Actions (#TODO)

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

## 👥 Auteurs

- data.gouv.fr, Direction interministérielle du numérique.
- Ecolab, Commissariat général au développement durable, Ministère en charge de l&rsquo;environnement.

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE.md) pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/opendatateam/udata-front-kit/issues)
- **Formulaire de contact** : [Formulaire de support](https://support.data.gouv.fr/)

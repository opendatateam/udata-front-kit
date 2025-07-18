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

#### Tests via [Vitest](https://vitest.dev/)

```sh
npm run test
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

### Workflow GitHub pour le déploiement

Le déploiement des verticales thématiques s'effectue via un workflow GitHub qui se déclenche automatiquement à partir du message de commit. Le format du message de commit doit être :

```
[<env>:<config_name>:<version_part>] <description>
```

**Paramètres :**
- **ENV** : `prod` ou `demo`/`preprod` suivant la verticale
- **CONFIG_NAME** : nom de la configuration (actuellement `ecologie`, `meteo`, `defis` ou `simplifions`)
- **VERSION_PART** : `major`, `minor` ou `patch`

**Exemple :**
```
[prod:ecologie:minor] nouvelle fonctionnalité incroyable
```

Le workflow se déclenche sur tous les push vers toutes les branches, mais ne s'exécute que si le message de commit commence par `[` (condition `startsWith(github.event.head_commit.message, '[')`). Cette condition n'est pas parfaite mais GitHub Actions ne supporte pas directement le déclenchement de workflows basé sur des expressions régulières dans les messages de commit.

Toutes les variables et secrets nécessaires pour ce workflow sont listés dans la section `env:` du [workflow de déploiement](.github/workflows/create-deploy-release.yml).

Le tag créé est utilisé lors de la construction de l'image et pendant le déploiement.

### Architecture de déploiement

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

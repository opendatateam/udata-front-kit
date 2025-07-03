# udata-front-kit

TEST TEST
Verticales thématiques adossées à [data.gouv.fr](https://www.data.gouv.fr/).

## Configuration

Chaque verticale est configurée dans un fichier `config.yaml` stocké sous [`configs/$verticale`](configs).

La variable d'environnement `VITE_SITE_ID` permet de définir la configuration utilisée au lancement de l'application.
Cette variable peut être définie dans le fichier [`.env`](.env) ou ses dérivés.

## Développement

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

## Librairies et plugins utilisés

### Librairies

- `@datagouv/components` // composants provenant de data.gouv.fr
- `@gouvminint/vue-dsfr` // intégration `vue` de composants issus du DSFR
- `@gouvfr/dsfr` // nécessaire pour les deux précédentes
- `@vueuse/core` // collection d'utilitaires `vue` (`useTitle`)
  - `@vueuse/integrations` // intégration supplémentaires de vueuse (`focustrap`)
- `unplugin-auto-import` - `vite.config.mts` // auto-import d'API `vue` (`ref`, `computed`…) et `vue-dsfr` ([d'après ce tutoriel](https://vue-ds.fr/guide/pour-commencer#avoir-un-bundle-optimise-et-une-dx-optimale))
- `unplugin-vue-components` - `vite.config.mts` // auto-import des composants custom et `vue-dsfr` ([idem](https://vue-ds.fr/guide/pour-commencer#avoir-un-bundle-optimise-et-une-dx-optimale))
- `@unhead/vue` // SEO (en gros)

### Formatage et validation du code

- `eslint` - `eslint.config.mjs`
  - `typescript-eslint`
  - `eslint-plugin-json`
  - `eslint-plugin-vue`
- `prettier` - `.prettierrc.mjs`
  - `prettier-plugin-organize-imports` // organise et/ou supprime les imports des fichiers

À chaque `git commit`, `husky` lance `lint-staged` qui formate les fichiers "staged" avec `prettier`.

## Auteurs

- data.gouv.fr, Direction interministérielle du numérique.
- Ecolab, Commissariat général au développement durable, Ministère en charge de l&rsquo;environnement.

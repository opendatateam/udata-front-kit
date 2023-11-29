# ecospheres-front

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

`CONFIG_NAME` env var is used to control which file in `configs/{CONFIG_NAME}/config.yaml` is used as config file. You can set it in the `.env` file(s).

## Project Setup

```sh
# If you use nvm, install the node version specified in .nvmrc
head .nvmrc | nvm install
nvm use

# Clone the repository
git clone git@github.com:ecolabdata/ecospheres-front.git
cd ecospheres-front

# Clean the cache
npm cache --force clean

# Do a clean install
npm clean-install --force

# Install Husky pre-commit hooks
npm run prepare
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Test with [Vitest](https://vitest.dev/)

```sh
npm run test
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Type checks with [TSc](https://www.typescriptlang.org/docs/handbook/compiler-options.html/)

```sh
npm run hint
```

### Code formatting with [Prettier](https://prettier.io/)

```sh
npm run format
```

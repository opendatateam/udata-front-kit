TL;DR:

- Communication is in [French](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006421209).
- Code and code documentation are in [English (BR)](https://en.wikipedia.org/wiki/English_as_a_lingua_franca).
- Code documentation is in the [JSDoc](https://jsdoc.app/) format.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Code styling is progamatically enforced and follows [Standard](https://standardjs.com/).
- Testing is done with [Vutest](https://vutest.dev) and [Cypress](https://www.cypress.io/).
- Pull requests, reviews, and merging, follow [GitHub Flow](https://guides.github.com/introduction/flow/).
- Change advertising follows [SemVer](http://semver.org/).

## Pull requests

We follow the [GitHub Flow](https://guides.github.com/introduction/flow/):
all code contributions are submitted via a pull request towards the `main`
branch.

Opening a Pull Request means you want that code to be merged. If you want to
only discuss it, then open a draft and send a link to your draft along with
your questions through whichever communication channel you prefer.

### Peer reviews

All pull requests must be reviewed by someone else than their original author.

To help reviewers, make sure to add to your PR a **clear text explanation**
of your changes.

In case of breaking changes, you **must** give details about what features were
deprecated.

> You must also provide guidelines to help contributors adapt their code to be
> compatible with the new version of the app.

## Advertising changes

### Version number

We follow the [semantic versioning](http://semver.org/) spec: any change
impacts the version number, and the version number conveys public interface
compatibility information **only**.

Examples:

#### Patch bump

- Internal optimization (such as store cache) with no consequence on the stores
  public interface.

#### Minor bump

- Adding a helper, adding a component, implementing a feature, etc.

#### Major bump

- Renaming or deprecating a component.
- Breaking changes to a public interface.

## Error messages

### Great error messages

We strive to deliver great error messages, which means they are:

- **Clear**: we tell precisely what caused them and why this is a problem.
- **Gentle**: we consider the error to be caused by legitimate ambiguity.
  Otherwise, it wouldn't need an error message but a design change.
- **Concise**: we help our users focus on solving their problems and deliver
  value, not on dumping tons of useless data on them.
- **Thorough**: we do not make guesses on the context and knowledge of our
  users. We provide as much context as possible.
- **Actionable**: we explain how to solve the problem as much as we can, and
  give links to additional documentation whenever possible.

### Example

- **Terrible**: Nothing.
- **Bad**: `Network error`.
- **Good**: `The description must be provided. Additionally, the expected format
is: ...`.
- **Great**: `The description provided contains invalid Markdown characters,
which will make it not to be rendered as expected. For information about 
Markdown, please take a look at https://docs.github.
com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github;
if you believe this is a mistake, please open an issue directly at
https://github.com/ecolabdata/ecospheres-front/issues/new; if you are not a 
technical person or prefer to talk to a human, please send an email to
ecospheres@developpement-durable.gouv.fr.`.

[More information](https://blogs.mulesoft.com/dev/api-dev/api-best-practices-response-handling/).

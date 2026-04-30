# Local development with `@datagouv/components-next`

Source: [datagouv/cdata — datagouv-components](https://github.com/datagouv/cdata/tree/main/datagouv-components)

To test unpublished changes `@datagouv/components-next` in this project, use [yalc](https://github.com/wclr/yalc) (we find it works better than `(p)npm link`).

**Install yalc globally (once):**

```bash
npm install -g yalc
```

**In `datagouv-components`, publish to the local yalc store:**

```bash
pnpm build && pnpm css && yalc publish
```

Both `build` and `css` are required: `build` compiles the JS, `css` generates `dist/components.css`.

**In this project, install from yalc:**

```bash
yalc add @datagouv/components-next
pnpm install
```

**After making changes in `datagouv-components`, push the update:**

```bash
pnpm build && pnpm css && yalc push
```

`yalc push` republishes and automatically updates all projects that have it added — no need to re-run `yalc add`. Then restart the dev server (`pnpm dev`) to pick up the changes — Vite does not watch `node_modules` by default.

**To restore the published npm version:**

```bash
yalc remove @datagouv/components-next
pnpm install
```

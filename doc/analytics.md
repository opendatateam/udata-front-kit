# Analytics: Matomo custom events

This documents the custom Matomo events tracked on ecologie.data.gouv.fr, mapped against
the measurement plan (refs `AUD-*`, `NAV-*`, `PAGE-*`, `SEARCH-*`, `TAG-*`, `COL-*`).

Events are fired via `trackEvent(category, action, name?)` from `@datagouv/components-next`
(`node_modules/@datagouv/components-next/src/functions/matomo.ts`), a thin wrapper around
`window.Matomo.getTracker().trackEvent(...)`. It no-ops if Matomo isn't loaded (blocked,
disabled, etc.), so it's always safe to call.

## Events

| Category                             | Action                | Name                                                          | Fired when                                                      | Source                                                              | Plan ref                       |
| ------------------------------------ | --------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------ |
| `Navigation principale`              | `Clic onglet`         | `<label du menu>`                                             | Click on any main nav item                                      | `src/components/NavigationComponent.vue`                            | NAV-05, NAV-07, NAV-09, NAV-10 |
| `Homepage - Collections thématiques` | `Clic collection`     | `Bloc 1 \| <titre>`, `Bloc 2 \| <titre>`, `Bloc 3 \| <titre>` | Click on one of the 3 featured collection cards on the homepage | `src/custom/ecospheres/components/home/HomeCollections.vue`         | COL-04, COL-06, COL-08         |
| `Moteur de recherche`                | `Recherche validée`   | _(none)_                                                      | Submit of the homepage hero search bar                          | `src/custom/ecospheres/components/home/HomeHero.vue`                | SEARCH-01                      |
| `Accueil`                            | `Clic tag thématique` | `<label du tag>`                                              | Click on a homepage thematic tag                                | `src/custom/ecospheres/components/home/HomeHero.vue` (pre-existing) | TAG-01                         |

The homepage hero search also fires a native Matomo Site Search event
(`getMatomo()?.trackSiteSearch(q, false, false)`), for Matomo's own Site Search report.
Category/results count are unknown at submit time (search executes on `/datasets`), so both
are passed as `false`, which Matomo's tracker treats as "not applicable" — the KPIs in the
plan are computed from the `trackEvent` above, not from this native call.

## Naming deviations from the spec

The spec (`Catégorie` / `Action` / `Nom de l'évènement` columns) isn't taken verbatim where it
conflicted with an existing event or the app's own conventions:

- **TAG-01** specifies `Navigation thématique` / `Clic tag` / `[nom du tag]`. The app already
  tracks homepage tag clicks as `Accueil` / `Clic tag thématique` / `<label>`
  (`HomeHero.vue`, pre-existing, not part of this change). Reused as-is rather than renamed —
  **the analytics setup (segments/funnels) must use `Clic tag thématique`, not `Clic tag`, as
  the Event Action.**
- **COL-04/06/08** specify category `Homepage - Collections thématiques` (spec's own wording,
  kept verbatim — it's the one place category naming diverges from the app's usual French-only
  convention, e.g. `Accueil`, but changing it wasn't worth the inconsistency with the spec's
  Action/Name-based funnel definitions in COL-02/03/05/07/09, which don't depend on category).

## Not implemented in code (Matomo-side configuration only)

These plan rows rely on native Matomo tracking (pageviews, downloads, visits) or on
segments/funnels built from the events above — no app code needed:

- **AUD-01, AUD-02**: native Matomo visits / unique visitors.
- **AUD-03**: segment `Visites qualifiées` = OR of all engagement actions above (built in Matomo).
- **AUD-04**: native download tracking + a Matomo Goal on dataset file downloads (the
  `Jeux de données` / `Télécharger un fichier` events already exist, from
  `@datagouv/components-next`'s `ResourceAccordion`/`ResourceExplorer` components).
- **NAV-01, NAV-02, NAV-03, NAV-06, NAV-08, NAV-11**: segments/funnels built on the events above.
- **NAV-04, NAV-12, NAV-13**: the plan marks Accueil/Contributeurs/À propos as untracked, but
  the nav click handler isn't scoped to specific items (all `config.website.menu` entries fire
  the same event with their own label) — simpler to maintain, and tracking a few extra items
  is harmless. Ignore `Clic onglet` events named `Accueil`, `Contributeurs` or `À propos` when
  building segments/funnels for NAV-01.
- **PAGE-01 to PAGE-12**: native pageview tracking + URL-based segments/funnels.
- **SEARCH-02, SEARCH-03**: funnels from `Recherche validée` to a dataset pageview/download.
- **TAG-02, TAG-03**: funnels from `Clic tag thématique` to a dataset pageview/download.
- **COL-01, COL-02, COL-03, COL-05, COL-07, COL-09**: segments/funnels on `Clic collection`.
- **COL-10**: explicitly untracked ("Autres collections thématiques (hors blocs suivis)" — the
  4th "see all collections" card on the homepage is not tracked).

## Known gaps / decisions to revisit

- **`q` auto-detection**: the spec requires _"ne pas utiliser q en détection automatique"_ for
  SEARCH-01 — if Matomo's site admin has `q` configured as an auto-detected Site Search
  parameter, every homepage tag click (which also navigates to `/datasets?q=...`) would be
  wrongly counted as a validated search. This is a Matomo admin setting, not something this
  change can enforce from code — check that `q` is **not** configured as an auto-detected
  Site Search parameter for this site.
- **Header search bar** (`src/components/SearchComponent.vue`, used in `HeaderComponent.vue`
  and reachable from the homepage) is **not** instrumented for SEARCH-01, only the homepage
  hero search bar is. `SearchComponent` is also reused in unrelated contexts (in-list filtering
  in `TopicFactorsList.vue`, the separate `culture` custom deployment), so tracking was scoped
  to the homepage hero search specifically rather than added to the shared component. If
  header-bar searches from the homepage should count too, this needs a dedicated opt-in (e.g. a
  prop) on `SearchComponent`.

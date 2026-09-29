// maplibre-gl v6 builds its worker URL from import.meta.url at runtime, which Vite's
// dep optimizer can't follow, so the worker 404s in dev and is missing from the prod
// build. `?worker&url` bundles it as its own asset and setWorkerUrl points maplibre at it.
import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)

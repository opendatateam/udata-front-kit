// maplibre-gl v6 resolves its worker from import.meta.url, which Vite does not
// bundle. This points it at the worker asset instead.
import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)

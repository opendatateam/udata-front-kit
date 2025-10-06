// https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/

export type SentryConfig = {
  dsn: string                         // Mandatory to send errors to Sentry
  domain_url?: string                 // Mandatory to send sourcemaps to Sentry. This is not used in sentry options, it is only used in vite.config.mts to send sourcemaps to the correct domain.
  environment?: string
  tracePropagationTargets?: RegExp[]
  tracesSampleRate?: number
  replaysSessionSampleRate?: number
  replaysOnErrorSampleRate?: number
}
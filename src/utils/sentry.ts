import logger from './logger'

const initSentry = async () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    logger.warn('Sentry DSN not configured')
    return
  }

  const Sentry = await import('@sentry/react')
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    environment: import.meta.env.VITE_NODE_ENV,
    beforeSend(event) {
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event
    },
  })
  logger.info('Sentry initialized successfully')
}

export { initSentry }

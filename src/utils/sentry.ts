import * as Sentry from '@sentry/react'
import logger from './logger'

const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    logger.warn('Sentry DSN not configured')
    return
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    environment: import.meta.env.VITE_NODE_ENV,
    beforeSend(event) {
      logger.info('Sentry event sent:', event)
      return event
    },
  })
  logger.info('Sentry initialized successfully')
}

export { initSentry }
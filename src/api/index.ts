// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import express from 'express';
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

export const createApp = () => {
  const app = express()
  app.use(express.json())
  app.use(limiter)

  return app
}
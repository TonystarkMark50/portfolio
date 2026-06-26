# Strapi Portfolio Backend

Self-hosted CMS for the portfolio frontend. Deploy via **Strapi Cloud** (recommended) or locally.

## Deploy to Strapi Cloud (free plan)

```bash
# 1. Install dependencies
npm install

# 2. Login to Strapi Cloud (opens browser)
npx strapi login

# 3. Deploy (takes ~2 min)
npx strapi deploy
```

That's it. Strapi Cloud auto-provisions PostgreSQL, SSL, and file storage. You'll get a URL like `https://portfolio-xxx.strapiapp.com`.

## Setup admin and seed data

After deploying, open your Strapi Cloud URL in a browser and create your admin account. Then run:

```bash
$env:STRAPI_URL="https://portfolio-xxx.strapiapp.com"
$env:STRAPI_ADMIN_EMAIL="admin@example.com"
$env:STRAPI_ADMIN_PASSWORD="your-password"
node ../scripts/strapi-admin.mjs
```

## Connect frontend

Set in your frontend `.env`:

```env
VITE_STRAPI_URL=https://portfolio-xxx.strapiapp.com
```

## Local development

```bash
npm run develop
# Admin at http://localhost:1337/admin
# API at http://localhost:1337/api
```

# Portfolio CMS — Headless Admin Panel

> A full-featured portfolio + CV website with a built-in headless CMS. Manage every piece of content from a sleek admin panel — no database tools needed.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

### Portfolio Site (Public)
- **Hero** — name, title, avatar with photo upload
- **About** — multi-section bio with paragraph management
- **Skills** — categorized skill badges with gradient visuals
- **Internships** — detailed experience entries with responsibilities and learnings
- **Projects** — cards with tags, links, and featured flag
- **Education** — degree, institution, GPA, timeline
- **Certifications** — badge-style cards with logo, credential ID, and verification links
- **Journey** — timeline view of your career story
- **Contact** — form with Cloudflare Turnstile CAPTCHA, sends to Supabase

### Admin Panel (Protected)
- **Dashboard** — quick stats, recent activity, portfolio health score
- **Profile** — edit name, title, bio, photo upload with drag-drop
- **About / Skills / Internships / Projects / Education / Certifications / Journey** — inline editing, auto-save, add/delete
- **Resume Studio** — live preview, ATS score, template switching, PDF export
- **Contact Inbox** — three-panel CRM (Inbox / Replied / Archived / Spam), notes, search, pagination
- **Media Library** — drag-drop upload, bucket filtering, detail panel, URL copy
- **SEO Manager** — meta title, description, keywords with live Google preview
- **Notifications** — slide-over panel with search, read/unread, delete
- **Backup Manager** — export all Supabase tables as JSON, import with preview, snapshot restore
- **GitHub Integration** — fetch repos by username, language breakdown, cached
- **AI Assistant** — chat UI with contextual actions, typing indicator
- **Analytics** — page views, devices, countries, traffic sources

### Security
- **Row-Level Security** — Supabase RLS policies on all tables
- **Input Validation** — Zod schemas on all forms (login, contact, profile, projects, etc.)
- **File Upload Validation** — MIME type, size, extension enforcement
- **Content Security Policy** — strict CSP headers via Netlify config
- **Session Hardening** — token expiry checks, role-based access
- **DOMPurify** — output sanitization for rendered content
- **Audit Logging** — all admin actions logged via audit service

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5.5 |
| **Build Tool** | Vite 5 |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS 3.4 (custom theme, dark mode, animations) |
| **Icons** | Lucide React |
| **Animation** | Framer Motion |
| **Backend / Auth / Storage** | Supabase |
| **Validation** | Zod 4 |
| **PDF Generation** | @react-pdf/renderer |
| **Error Tracking** | Sentry (React SDK) |
| **CAPTCHA** | Cloudflare Turnstile |
| **Logging** | Winston (browser-compatible) |
| **Testing** | Jest 30 + Testing Library |
| **Linting** | ESLint 9 + typescript-eslint |
| **Deployment** | Netlify (recommended) or Docker / nginx |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- A Supabase service role key (for running migrations)

### Installation

```bash
git clone <your-repo-url> portfolio
cd portfolio
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OWNER_EMAIL=your@email.com
VITE_WEB3FORMS_ACCESS_KEY=your-key     # optional
VITE_TURNSTILE_SITE_KEY=your-key       # optional
VITE_SENTRY_DSN=your-dsn               # optional
VITE_BASE_PATH=/                       # optional, for sub-path deploys
```

> **Note:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required — the app will throw on boot if either is missing.

### Database Setup

Run the SQL in `src/utils/supabaseSetup.ts` in your Supabase Dashboard SQL Editor. This creates RLS policies for all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- ... (full script in the file)
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. The admin panel is at `/admin`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint across all files |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## Deployment

### Netlify (Recommended)

The repo includes a `netlify.toml` with SPA redirects and security headers. To deploy:

1. Push to GitHub
2. Connect repo in Netlify
3. Add environment variables in Netlify dashboard
4. Deploy — done

### Docker

```bash
docker build -f deployment/Dockerfile -t portfolio .
docker run -p 8080:80 portfolio
```

Serves the app via nginx on port 80.

### GitHub Pages

The repo includes a `.github/workflows/deploy.yml` workflow. Enable GitHub Pages in your repo settings (Source: GitHub Actions) and push to `main`.

---

## Project Structure

```
src/
├── admin/              # Admin panel pages (CRUD for each content type)
├── components/         # Shared UI components (ContentEditor, Navbar, Modal, etc.)
│   └── admin/          # Admin-specific components (AdminLayout, AdminMedia, etc.)
│   └── sections/       # Public site section components
├── config/             # App configuration (env vars, constants)
├── context/            # React contexts (Admin, Theme, Toast)
├── features/           # Feature modules (modular, self-contained)
│   ├── ai-assistant/
│   ├── analytics/
│   ├── backup/
│   ├── contact-crm/
│   ├── github/
│   ├── health-engine/
│   ├── media-library/
│   ├── notifications/
│   ├── resume-studio/
│   └── seo-manager/
├── hooks/              # Shared React hooks
├── lib/                # Supabase client, loaders, API helpers
├── pages/              # Route pages (AdminApp, AdminLogin)
├── sections/           # Public site section components (Hero, About, Skills, etc.)
├── services/           # Data services (profile, projects, certifications, etc.)
├── utils/              # Utilities (validation, logger, Sentry, file validation)
└── App.tsx             # Root component with lazy-loaded routes
```

---

## Testing

```bash
npm test
```

Tests are in `__tests__/` and use Jest with ts-jest and jsdom. Mocks for Supabase are in `__tests__/__mocks__/supabase.ts`.

---

## License

MIT — feel free to use this as a template for your own portfolio.

# Oxxila

Premium skincare storefront built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Landing page at `/home` — hero, trusted brands, skin concerns, best sellers, how-it-works, contact, footer
- Live product data from the Oxxila API (with static fallbacks)
- Authentication — email/password, register, forgot password, Google OAuth
- Light / dark theme

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173/home](http://localhost:5173/home). The dev server proxies `/api/v1` to the Oxxila backend (see `vite.config.ts`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Routes

| Path | Page |
|------|------|
| `/home` | Landing page |
| `/` | Redirects to `/home` |
| `/login` | Sign in |
| `/register` | Create account |

## Environment

Copy `.env.example` to `.env` if you need to override the API base URL.

Backend OAuth redirects must match the frontend:

```
OAUTH_SUCCESS_REDIRECT=https://your-domain/home
OAUTH_FAILURE_REDIRECT=https://your-domain/login?error=google_failed
```

Google sign-in returns the access token in the URL hash (`#accessToken=…`).

## Deployment

Configured for Vercel with API rewrites in `vercel.json`.

# Twogether

Twogether is a social movie and TV app built with Next.js. It helps people discover what to watch, share recommendations, keep a watchlist, and connect with friends.

## Features

- Browse trending movies, TV shows, anime, and K-drama titles from TMDB.
- Search movies, shows, artists, and binge-worthy collections.
- Open detailed watch pages with metadata, trailers, recommendations, comments, and watchlist actions.
- Create and manage public or private recommendations.
- Save titles to a personal watchlist.
- Get AI-powered movie recommendations from a natural-language prompt.
- Manage friends, profiles, messages, and account settings.
- SEO-ready metadata, sitemap, robots config, and PWA manifest support.

## Tech Stack

- Next.js 15 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase for auth, database, storage-facing user data, and server actions
- TMDB API for movie and TV metadata
- Google Gemini API for AI recommendations
- Cloudinary unsigned uploads for profile/media assets
- SWR for client-side data refresh
- Sonner for toast notifications

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` manually with the variables below.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TMDB_API_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
```

Starts the local Next.js development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build locally.

```bash
npm run lint
```

Runs ESLint on project source files, excluding generated build and service-worker files.

```bash
npx tsc --noEmit
```

Runs TypeScript validation without emitting files.

## Project Structure

```text
app/             App Router pages, layouts, route handlers, loading states
actions/         Server actions for auth, recommendations, watchlists, friends
components/      Shared UI components
sections/        Homepage and large page sections
utils/           Supabase, TMDB, AI, SEO, and adapter helpers
types/           Shared TypeScript types
constants/       Static app constants and placeholder data
stores/          Client state stores
public/          Static images, icons, and manifest assets
```

## Main Routes

- `/` - landing page with recent watching and feature sections
- `/browse` - browse hub
- `/browse/movies` - trending movies
- `/browse/tv` - trending TV shows
- `/browse/anime` - trending anime
- `/browse/kdrama` - trending K-drama
- `/binge` - collection and franchise discovery
- `/search/[query]` - movie, show, and artist search results
- `/search/collections/[query]` - collection search results
- `/tmdb/watch/[type]/[id]/[slug]` - TMDB watch detail page
- `/watch/[id]/[movieTitle]` - recommendation watch page
- `/recos` - public recommendations
- `/recommend` - create a recommendation
- `/my-recommendations` - current user's recommendations
- `/watchlist` - current user's saved titles
- `/ai-recommend` - AI recommendation prompt
- `/friends` - friend search and friend list
- `/messages` - messaging
- `/profile/[username]/[userId]` - user profile

## Environment Notes

- `NEXT_PUBLIC_SITE_URL` is used for SEO metadata and should match the deployed app URL.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for Supabase clients.
- `SUPABASE_SERVICE_ROLE_KEY` is used only on the server for privileged Supabase operations.
- `TMDB_API_KEY` powers browse, search, collection, trailer, and watch metadata routes.
- `GEMINI_API_KEY` powers AI recommendation generation.
- Cloudinary variables are required for unsigned client uploads.

## Deployment

This app is ready for Vercel-style deployment. Add the environment variables in the hosting dashboard, then build with:

```bash
npm run build
```

After deployment, update `NEXT_PUBLIC_SITE_URL` to the production domain so metadata, sitemap URLs, and canonical links resolve correctly.

## Database cleanup

The watch-party feature has been removed. Apply the SQL in `supabase/migrations/20261011000000_remove_watch_party.sql` through the Supabase SQL Editor to remove its four empty tables and associated table policies/indexes. This migration preserves unrelated notifications.

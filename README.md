# Ronin Capture — Samurai Screen Recorder

A browser-based screen recording app with 8 unique samurai-inspired themes,
built with React + Vite + Supabase (Auth, Postgres, Storage).

## Features

- **Recording:** capture the entire screen, an application window, or a browser tab
- **Controls:** Start / Pause / Resume / Stop, with a 15-minute auto-stop cap (warning at 13 min)
- **File management:** download recordings, delete recordings, view full history
- **Auth:** full email/password signup & login (Supabase Auth), each user only sees their own recordings (Row Level Security)
- **Rate limiting / quotas (server-side):** each user is capped at 50 saved recordings, 10 saves per rolling hour, and 2 GB of total storage — enforced by a Postgres trigger, so it can't be bypassed from the browser
- **8 samurai themes:** Crimson Shogun, Bamboo Forest, Moonlit Ronin, Cherry Blossom, Ink & Steel, Golden Temple, Storm Warrior, Ashen Dojo — each with its own color palette, font, ambient background animation, and click/tap touch effect. Ink & Steel additionally has a trailing cursor effect.

## Tech Stack

- React 18 + Vite + React Router
- Tailwind CSS (theme-driven via CSS variables)
- Supabase: Auth, Postgres (`recordings` table), Storage (private `recordings` bucket)
- Browser `MediaRecorder` + `getDisplayMedia` APIs — no video ever touches a third-party server besides your own Supabase project

## 1. Prerequisites

- Node.js 18+
- A free Supabase project: https://supabase.com/dashboard

## 2. Set up Supabase

1. Create a new Supabase project.
2. Open **SQL Editor** and run the contents of `supabase/schema.sql`. This creates:
   - the `recordings` table with Row Level Security policies (each user only sees their own rows)
   - a private `recordings` Storage bucket with policies scoping access to `recordings/{user_id}/...`
   - a trigger enforcing per-user limits: max 50 saved recordings, max 10 saves/hour, max 2 GB total storage (edit the constants inside `enforce_recording_limits()` in the SQL file to change these)
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
4. In **Authentication → Providers**, make sure Email is enabled. If you don't want email confirmation for local testing, disable "Confirm email" under Authentication → Settings.

> **Already have this project set up from before?** If you're updating an existing project rather than starting fresh, you only need to re-run the new trigger section at the bottom of `schema.sql` (from `-- Rate limiting / quotas` onward) — the rest is unchanged and safe to skip.

## 3. Configure the app

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Install & run

```bash
npm install
npm run dev
```

Open the printed local URL (e.g. `http://localhost:5173`). Screen capture requires a secure context — `localhost` counts as secure, so this works out of the box in dev.

## 5. Build for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Deploy the `dist/` folder to Vercel or Netlify. Add the two `VITE_SUPABASE_*` env vars in your hosting provider's project settings (Vercel: Project → Settings → Environment Variables). Screen recording requires HTTPS in production — both Vercel and Netlify serve over HTTPS by default.

## Project Structure

```
src/
  context/        AuthContext, ThemeContext
  components/      Navbar, ThemeSwitcher, BackgroundEffect, TouchEffectLayer, ProtectedRoute
  hooks/           useScreenRecorder.js (MediaRecorder logic)
  pages/           Login, Signup, Dashboard, Recorder, Recordings, VideoPreview
  themes/          themeConfig.js (the 8 theme definitions)
  styles/          themes.css (CSS variables + keyframe animations per theme)
  lib/             supabase.js (client), format.js (duration/size helpers)
supabase/
  schema.sql       Database table + RLS policies + storage bucket + storage policies
```

## Notes on browser support

`getDisplayMedia` (screen/window/tab capture) is supported in current Chrome, Edge, and Firefox. Safari support is partial and varies by version — test in your target browser before relying on tab-level capture there.

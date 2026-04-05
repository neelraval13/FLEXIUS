<p align="center">
  <img src="public/logo-144.webp" alt="Flexius" width="80" height="80" />
</p>

<h1 align="center">Flexius</h1>

<p align="center">
  <strong>AI-powered fitness tracker and workout coach — built as an offline-first PWA.</strong>
</p>

<p align="center">
  Talk to your coach, plan your workouts, log sets with your voice, track PRs, and get streak reminders — all from your phone at the gym, even without signal.
</p>

---

## What It Does

Flexius is a personal fitness app where an AI coach (powered by Gemini 2.5 Flash) acts as your gym buddy. Instead of navigating menus and forms, you just talk:

- *"I did 3 sets of bench at 65kg"* → logged
- *"Plan a push day for tomorrow"* → structured plan generated with weights based on your history
- *"Swap lat pulldowns for pull-ups"* → plan updated
- *"What weight should I use for overhead press?"* → coach checks your last 5 sessions and suggests

The AI has access to your full exercise database, workout history, and today's plan — it doesn't guess, it looks things up.

## Features

### Core
- **AI Coach** — conversational workout planning, logging, and advice via Gemini 2.5 Flash with 15 function-calling tools
- **Workout Plans** — AI-generated daily plans with prescribed sets, reps, weights, rest times, and coaching notes
- **Workout Logging** — log via the AI chat, the log form, or quick-log buttons on the plan page
- **Exercise Database** — 50+ exercises with muscle groups, equipment, difficulty, alternatives, and video tutorials
- **History** — calendar and list view of all past workouts with full detail

### PWA & Offline
- **Installable PWA** — add to home screen on iOS and Android, runs standalone
- **Offline Workout Page** — today's plan loads from IndexedDB even without network
- **Offline Logging** — workouts queue in IndexedDB and auto-sync when connectivity returns
- **Background Sync** — queued logs replay via REST endpoint, auto-complete plan exercises
- **Service Worker** — split caches (static/pages), size limits, cache versioning, branded offline fallback
- **Update Toast** — "New version available" prompt with controlled reload

### Tracking & Insights
- **Personal Records** — auto-detected on every log; full-screen celebration overlay with haptic feedback when you hit a new max
- **PR Badges** — exercise detail page shows current max weight and max volume with dates
- **Muscle Group Heatmap** — SVG body map on the dashboard showing which muscles you trained this week, color-coded by intensity
- **Streak Tracking** — consecutive workout day counter on the dashboard
- **Weekly Progress Report** — dedicated report page with stats grid, muscle coverage, PRs, and week-over-week trends
- **Progress Charts** — per-exercise weight/duration progression over time

### Notifications
- **Push Notifications** — Web Push via VAPID keys with per-device subscription management
- **Daily Streak Reminders** — cron at 6PM IST reminds users to keep their streak alive
- **Weekly Report Push** — Sunday 8PM IST summary of the week's training with stats
- **Notification Bell** — header icon to enable/disable notifications with three visual states

### Gym UX
- **Rest Timer** — auto-starts after logging a set, circular countdown with haptic ticks at 10s/5s/3s/2s/1s, vibration pattern on completion, ±15s/30s adjust buttons, minimizable
- **Voice Logging** — mic button in chat and mini-chat, uses Web Speech API for hands-free logging
- **Mini Chat** — floating chat overlay on the workout page with plan context awareness
- **Quick Log** — one-tap logging from the plan page with confirmation
- **Dark Theme** — navy/blue palette designed for gym lighting
- **Install Prompt** — custom banner for Android with 24h dismiss cooldown

### Other
- **Instagram Reel Analysis** — paste a reel URL, the AI identifies exercises shown and offers to add them to your database
- **Google Search Grounding** — general fitness/nutrition questions use Google Search for real-time information with source citations
- **Exercise CRUD** — full management of exercises, cardio/stretching, equipment, and muscle groups via settings
- **User Profiles** — height, weight, DOB, gender, fitness goal
- **Favorites** — star exercises for quick access and AI prioritization
- **Light/Dark Theme Toggle**

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| AI | Gemini 2.5 Flash via `@google/genai` with function calling |
| Database | Turso (LibSQL) via Drizzle ORM |
| Auth | NextAuth v5 (credentials) |
| Styling | Tailwind CSS 4, shadcn/ui, Vaul (drawers) |
| Charts | Recharts |
| PWA | Custom service worker, IndexedDB (offline queue + plan cache) |
| Push | Web Push API, `web-push` library, Vercel Cron |
| Voice | Web Speech Recognition API |
| Deploy | Vercel |

## Architecture

### AI Function-Calling Loop

The chat API implements a two-phase architecture:

**Phase 1 — Tool Loop (up to 10 rounds):** Gemini receives the user message along with a 380-line dynamic system prompt containing the user's profile, exercise database (with IDs), today's plan, and favorites. It decides which tools to call — logging workouts, querying history, saving plans, searching exercises, creating new exercises, or analyzing reels. Results feed back into the conversation for multi-step reasoning.

**Phase 2 — Google Search Grounding:** If no tools were called (general question), the same query re-runs with Google Search enabled, providing real-time fitness/nutrition information with source citations.

### Offline Data Flow

```
User logs workout offline
  → Server action fails
  → Caught → stored in IndexedDB (offline-queue)
  → UI shows "Queued" state
  → User comes back online
  → `online` event fires
  → OfflineSync component replays queue via /api/log
  → Logs inserted + plan exercises auto-completed
  → UI shows "Synced" confirmation
```

### Database Schema

10 tables: `users`, `exercises`, `cardio_stretching`, `equipment`, `muscle_groups`, `workout_plans`, `workout_plan_exercises`, `workout_logs`, `user_profiles`, `favorite_exercises`, `push_subscriptions`.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A [Turso](https://turso.tech) database
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### Setup

```bash
git clone https://github.com/neelraval13/FLEXIUS.git
cd FLEXIUS
pnpm install
```

Create `.env.local`:

```env
# Database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# AI
GEMINI_API_KEY=your-gemini-api-key

# Auth
AUTH_SECRET=your-random-secret  # openssl rand -base64 32

# Push Notifications (generate with: npx tsx scripts/generate-vapid-keys.ts)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# Cron Authentication
CRON_SECRET=your-random-cron-secret

# Optional: Instagram Reel Analyzer
REEL_ANALYZER_URL=your-analyzer-url
REEL_ANALYZER_TOKEN=your-analyzer-token
```

Push the schema and seed data:

```bash
pnpm db:push
pnpm db:seed
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and register an account.

### Generate VAPID Keys

```bash
npx tsx scripts/generate-vapid-keys.ts
```

Add the output to `.env.local` and your Vercel environment variables.

### Deploy

```bash
pnpm build
```

Deploy to Vercel. The `vercel.json` configures two cron jobs:

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Daily 6:00 PM IST | `/api/push/remind` | Streak and plan reminders |
| Sunday 8:00 PM IST | `/api/push/weekly-report` | Weekly progress summary |

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes
│   │   ├── chat/           # AI coach chat
│   │   ├── exercises/      # Exercise browser + detail
│   │   ├── history/        # Workout history (calendar/list)
│   │   ├── log/            # Manual workout logging
│   │   ├── profile/        # User profile + favorites
│   │   ├── report/weekly/  # Weekly progress report
│   │   ├── settings/       # Exercise/equipment CRUD
│   │   └── workout/today/  # Today's plan + rest timer
│   ├── (auth)/             # Registration
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── chat/           # AI chat with function calling
│   │   ├── log/            # Offline sync endpoint
│   │   ├── pr/             # PR detection
│   │   └── push/           # Subscribe, remind, weekly-report
│   └── login/
├── components/
│   ├── chat/               # Chat UI (input, bubbles, markdown)
│   ├── dashboard/          # Stats, streak, heatmap, quick actions
│   ├── exercises/          # Browser, detail, PR card, charts
│   ├── history/            # Calendar, log items, delete
│   ├── log/                # Log form, per-set, exercise selector
│   ├── report/             # Weekly report view
│   ├── settings/           # CRUD forms for exercises/equipment
│   ├── ui/                 # shadcn/ui primitives
│   └── workout/            # Plan cards, quick-log, rest timer, mini-chat
├── db/
│   ├── queries/            # Data access layer
│   └── schema.ts           # Drizzle schema (10 tables)
├── lib/
│   ├── build-system-prompt.ts  # Dynamic 380-line AI system prompt
│   ├── tools.ts            # 15 AI function declarations + handlers
│   ├── offline-queue.ts    # IndexedDB queue for offline logs
│   ├── plan-cache.ts       # IndexedDB cache for today's plan
│   ├── push.ts             # Web Push sending utility
│   ├── use-voice-input.ts  # Web Speech API hook
│   └── weekly-report.ts    # Report data aggregation
└── types/                  # TypeScript interfaces
public/
├── sw.js                   # Service worker (caching, offline, push)
├── offline.html            # Branded offline fallback
├── offline-workout.html    # Offline workout page (reads from IndexedDB)
└── manifest.json           # PWA manifest with shortcuts
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm db:push` | Push schema to Turso |
| `pnpm db:seed` | Seed exercise data |
| `pnpm db:studio` | Open Drizzle Studio |
| `npx tsx scripts/generate-vapid-keys.ts` | Generate VAPID keys for push |
| `npx tsx scripts/generate-icons.ts` | Regenerate PWA icons from logo |

## Testing Push Notifications

After deploying, trigger notifications manually:

```bash
# Daily reminder
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/push/remind

# Weekly report
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/push/weekly-report
```

## License

Private.

## Author

Built by [Neel Raval](https://github.com/neelraval13).

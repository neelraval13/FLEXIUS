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

Flexius is a personal fitness app where an AI coach acts as your gym buddy. Instead of navigating menus and forms, you just talk:

- *"I did 3 sets of bench at 65kg"* → logged
- *"Plan a push day for tomorrow"* → structured plan generated with weights based on your history
- *"Swap lat pulldowns for pull-ups"* → plan updated
- *"What weight should I use for overhead press?"* → coach checks your last 5 sessions and suggests

The AI has access to your full exercise database, workout history, and today's plan — it doesn't guess, it looks things up.

**Bring your own intelligence** — Flexius works out of the box with its built-in AI coach. Want more control? Plug in your own API key for Anthropic, OpenAI, or Gemini — and pick your model right from the chat.

## Features

### Core
- **AI Coach** — conversational workout planning, logging, and advice with 13 function-calling tools
- **Multi-Provider LLM** — bring your own API key for Claude, OpenAI, or Gemini; pick your model in chat
- **Workout Plans** — AI-generated daily plans with prescribed sets, reps, weights, rest times, and coaching notes
- **Workout Logging** — log via the AI chat, the log form, or quick-log buttons on the plan page
- **Exercise Database** — 50+ exercises with muscle groups, equipment, difficulty, alternatives, and video tutorials
- **Per-User Catalog** — seed exercises are shared and read-only; user-created exercises are private to each user
- **History** — calendar and list view of all past workouts with full detail

### PWA & Offline
- **Installable PWA** — add to home screen on iOS and Android, runs standalone
- **Offline Workout Page** — today's plan loads from IndexedDB even without network
- **Offline Logging** — workouts queue in IndexedDB and auto-sync when connectivity returns
- **Background Sync** — queued logs replay via REST endpoint, auto-complete plan exercises
- **Service Worker** — split caches (static/pages), size limits, cache versioning, branded offline fallback
- **Update Toast** — "New version available" prompt with controlled reload

### Tracking & Insights
- **Personal Records** — detected before each log insert (no post-insert race condition); full-screen celebration overlay with haptic feedback
- **PR Badges** — exercise detail page shows current max weight and max volume with dates
- **Muscle Group Heatmap** — dual-view front/back SVG body map on the dashboard showing which muscles you trained this week, color-coded by intensity; smart pulse indicator when posterior muscles are active
- **Streak Tracking** — consecutive workout day counter on the dashboard
- **Weekly Progress Report** — dedicated report page with stats grid, muscle coverage, PRs, and week-over-week trends
- **Progress Charts** — per-exercise weight/duration progression over time

### Notifications
- **Push Notifications** — Web Push via VAPID keys with per-device subscription management
- **Daily Streak Reminders** — cron at 6PM user-local-time reminds users to keep their streak alive
- **Weekly Report Push** — Sunday 8PM user-local-time summary of the week's training with stats
- **Notification Bell** — header icon to enable/disable notifications with three visual states

### Gym UX
- **Rest Timer** — auto-starts after logging a set, circular countdown with haptic ticks at 10s/5s/3s/2s/1s, vibration pattern on completion, ±15s/30s adjust buttons, minimizable
- **Voice Logging** — mic button in chat and mini-chat, uses Web Speech API for hands-free logging
- **Mini Chat** — floating chat overlay on the workout page with plan context awareness
- **Quick Log** — one-tap logging from the plan page with confirmation
- **Chat Persistence** — conversations saved in localStorage, survive page refresh and app close; cleared on logout
- **Dark Theme** — navy/blue palette designed for gym lighting
- **Install Prompt** — custom banner for Android with 24h dismiss cooldown

### Security & Multi-User
- **bcrypt Password Hashing** — 12 salt rounds with transparent migration from legacy SHA-256 hashes on login
- **Per-User Data Isolation** — exercises, equipment, and muscle groups are scoped by user; seed data is shared and immutable
- **Ownership Verification** — update/delete operations verify row ownership; seed data cannot be mutated
- **Rate Limiting** — 20 requests/min per user on the chat API when using server's default key; no limits with your own key
- **Cron Auth** — push notification endpoints require `CRON_SECRET` (blocks when unset)
- **Per-User Timezone** — all date calculations respect the user's profile timezone (default: Asia/Kolkata)

### Other
- **Instagram Reel Analysis** — paste a reel URL, the AI identifies exercises shown and offers to add them to your database
- **Google Search Grounding** — general fitness/nutrition questions use Google Search for real-time information with source citations (Gemini provider only)
- **Graceful Provider Errors** — invalid keys, rate limits, and billing issues return actionable user-facing messages
- **Exercise CRUD** — full management of exercises, cardio/stretching, equipment, and muscle groups via settings
- **User Profiles** — height, weight, DOB, gender, fitness goal, timezone, AI provider settings
- **Favorites** — star exercises for quick access and AI prioritization
- **Light/Dark Theme Toggle**

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| AI | Multi-provider: Gemini (default), Claude, OpenAI — via adapter abstraction |
| Database | Turso (LibSQL) via Drizzle ORM |
| Auth | NextAuth v5 (credentials, bcrypt) |
| Styling | Tailwind CSS 4, shadcn/ui, Vaul (drawers) |
| Charts | Recharts |
| PWA | Custom service worker, IndexedDB (offline queue + plan cache + chat history) |
| Push | Web Push API, `web-push` library, Vercel Cron |
| Voice | Web Speech Recognition API |
| Deploy | Vercel |

## Architecture

### LLM Abstraction Layer

```
src/lib/llm/
├── types.ts            # Provider-neutral interface (LLMAdapter)
├── tool-schemas.ts     # 13 tools in standard JSON Schema format
├── gemini-adapter.ts   # Gemini adapter (@google/genai SDK)
├── claude-adapter.ts   # Claude adapter (raw fetch, no SDK)
├── openai-adapter.ts   # OpenAI adapter (raw fetch, no SDK)
├── errors.ts           # LLMProviderError with user-friendly messages
└── index.ts            # Factory: createLLMAdapter(provider, key, model)
```

Each adapter implements `chat()`, `continueWithToolResults()`, `searchGrounded()`, and `reset()`. The chat route is provider-agnostic — it calls the adapter interface and the adapter handles wire format translation.

### AI Function-Calling Loop

The chat API implements a two-phase architecture:

**Phase 1 — Tool Loop (up to 10 rounds):** The LLM receives the user message along with a dynamic system prompt containing the user's profile, exercise database (with IDs), today's plan, and favorites. It decides which tools to call — logging workouts, querying history, saving plans, searching exercises, creating new exercises, or analyzing reels. Results feed back into the conversation for multi-step reasoning. The system prompt is cached per-user with a 30-second TTL to reduce DB queries.

**Phase 2 — Search Grounding:** If no tools were called (general question), the same query re-runs with web search enabled. All three providers support this natively — Gemini uses Google Search, Claude uses its built-in web search tool, and OpenAI uses web search preview. Results include source citations.

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

11 tables: `users`, `exercises`, `cardio_stretching`, `equipment`, `muscle_groups`, `workout_plans`, `workout_plan_exercises`, `workout_logs`, `user_profiles`, `favorite_exercises`, `push_subscriptions`.

The four catalog tables (`exercises`, `cardio_stretching`, `equipment`, `muscle_groups`) have a nullable `user_id` column: `NULL` = shared seed data (immutable), non-null = user-created (private, mutable by owner only).

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

# AI (server-side — users can also bring their own keys via profile)
GEMINI_API_KEY=your-gemini-api-key

# Auth
AUTH_SECRET=your-random-secret  # openssl rand -base64 32

# Push Notifications (generate with: npx tsx scripts/generate-vapid-keys.ts)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# Cron Authentication (required — endpoints block when unset)
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
| Daily 12:30 UTC | `/api/push/remind` | Streak and plan reminders (user-local-time aware) |
| Sunday 14:30 UTC | `/api/push/weekly-report` | Weekly progress summary |

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes
│   │   ├── chat/           # AI coach chat
│   │   ├── exercises/      # Exercise browser + detail
│   │   ├── history/        # Workout history (calendar/list)
│   │   ├── log/            # Manual workout logging
│   │   ├── profile/        # User profile + favorites + AI coach settings
│   │   ├── report/weekly/  # Weekly progress report
│   │   ├── settings/       # Exercise/equipment CRUD
│   │   └── workout/today/  # Today's plan + rest timer
│   ├── (auth)/             # Registration
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── chat/           # AI chat (provider-agnostic, rate-limited)
│   │   ├── log/            # Offline sync endpoint
│   │   ├── pr/             # PR detection (pre-insert)
│   │   └── push/           # Subscribe, remind, weekly-report
│   └── login/
├── components/
│   ├── chat/               # Chat UI (input, bubbles, markdown, model selector)
│   ├── dashboard/          # Stats, streak, front/back heatmap, quick actions
│   ├── exercises/          # Browser, detail, PR card, charts
│   ├── history/            # Calendar, log items, delete
│   ├── log/                # Log form, per-set, exercise selector
│   ├── report/             # Weekly report view
│   ├── settings/           # CRUD forms for exercises/equipment
│   ├── ui/                 # shadcn/ui primitives
│   └── workout/            # Plan cards, quick-log, rest timer, mini-chat
├── db/
│   ├── queries/            # Data access layer (ownership-scoped)
│   └── schema.ts           # Drizzle schema (11 tables)
├── lib/
│   ├── llm/                # Multi-provider LLM abstraction
│   │   ├── types.ts        # Adapter interface
│   │   ├── tool-schemas.ts # 13 tools in JSON Schema
│   │   ├── gemini-adapter.ts
│   │   ├── claude-adapter.ts
│   │   ├── openai-adapter.ts
│   │   ├── errors.ts       # Provider error handling
│   │   └── index.ts        # Factory
│   ├── auth.ts             # NextAuth + bcrypt with legacy migration
│   ├── build-system-prompt.ts  # Dynamic AI system prompt (cached 30s)
│   ├── plan-completion.ts  # Shared auto-complete utility
│   ├── rate-limit.ts       # In-memory sliding-window rate limiter
│   ├── tools.ts            # 13 AI function handlers
│   ├── user-timezone.ts    # Timezone utilities
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
| `pnpm db:seed` | Seed exercise data (preserves user-created exercises) |
| `pnpm db:generate` | Generate migration files from schema |
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

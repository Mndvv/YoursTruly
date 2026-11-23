# Project Plan: OSS LingoClip (Working Title: YoursTruly)

This document serves as the architectural blueprint, engineering standard, AI agent workflow, and development roadmap for **OSS LingoClip (YoursTruly)**—an open-source, self-hostable language learning platform built around YouTube music videos with **word-level lyric synchronization**, assisted lyric fetching from a self-hosted Lyrica instance, manual sync/wording authoring, and transliteration support.

---

## 1. Project Overview & Core Principles

* **Media Source:** YouTube IFrame Player API (no audio/video file hosting or media streaming on our own servers).
* **Assisted Lyrics Fetch:** Backend proxy integration with a self-hosted Lyrica instance (`https://lyrica.collei.my.id/`, running `Wilooper/Lyrica` latest).
* **Manual Curation & Word-Level Sync:** Uploaders pick the YouTube video, confirm the matching lyric candidate from Lyrica, configure video start/end boundaries, adjust global offset, fine-tune word-level timestamps, fix wording/typos, and verify or add transliterations.
* **Gameplay:** True to LingoClip—**Write Mode** & **Choice Mode**, percentage-based difficulty levels, and **Auto-Pause** (enabled by default, toggleable via user preferences).
* **Access Model:** **No sign-in** for the initial phase (open uploads protected by anti-abuse controls and secret edit tokens).
* **Self-Hostable:** Single-command deployment via `docker compose up -d` with zero-config SQLite by default and optional PostgreSQL for production scale.

---

## 2. AI Agent Workflow & Continuity Protocol (MANDATORY)

This repository is designed to be built iteratively by AI coding agents with seamless handoffs across sessions or different AI models. **Every AI agent working on this project MUST follow these rules:**

### 2.1. Mandatory Bootstrap (Before Writing Any Application Code)
Before scaffolding packages or writing feature code, the AI agent **MUST** complete these exact starting steps:
1. **Initialize Git Repository:** Run `git init` (if not already initialized) and configure `.gitignore`.
2. **Read Local Lyrica Docs:** Inspect the Lyrica documentation placed in the repository root folder (e.g., `lyrica-docs/` or `LYRICA_DOCS.md`) before designing or implementing any Lyrica API calls or response normalizers. **Never guess Lyrica endpoints or JSON schemas**—always verify against the root-level Lyrica docs.
3. **Create `AGENTS.md`:** Distill the coding standards, No Godmode limits, OOP/Component boundaries, and handoff rules from `PLANNING.md` into a concise, actionable instruction file for future AI agents.
4. **Create `README.md`:** Document the project overview, monorepo structure, local development commands, environment variables, and Docker self-hosting instructions.
5. **Create `PROGRESS.md`:** Create a single source-of-truth progress tracker in the root directory.
6. **Initial Commit:** Commit these bootstrap files as the very first commit (`chore: bootstrap project docs, agent guidelines, and progress tracker`).

### 2.2. Real-Time Single-File Progress Tracking (`PROGRESS.md`)
All development progress **MUST** be maintained in real time in a single file: `PROGRESS.md`.
**Crucial Rule:** Update `PROGRESS.md` immediately *before* starting any atomic unit (marking it in-progress) and immediately *after* verifying it (marking it done). **Never delay updating until the end of a session or milestone**, ensuring that if token or context limits are reached mid-run, the exact active state and resume point are already persisted on disk.
Always keep updated:
* **Current Phase & Active Task**
* **Completed Checklist** (with brief notes and commit hashes)
* **Architectural Decisions / Deviations** (if any)
* **Known Issues / Blockers**
* **Exact Next Step** (clear enough for a brand-new AI session to resume immediately without re-scanning the entire codebase)

### 2.3. Strict Git Commit Discipline
* **Commit Every Change:** Every atomic task, feature, refactor, or bug fix **MUST** be committed immediately after verification (`bun test` / typecheck / build).
* **Conventional Commits:** Use clear prefixes (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`).
* **Handoff Readiness:** Never leave uncommitted half-finished work at the end of a turn or task. If token limits are approaching, commit stable work, update `PROGRESS.md` with the exact stopping point, and commit `PROGRESS.md`.

---

## 3. Tech Stack & Monorepo Structure

The project uses **Bun Workspaces** to cleanly isolate pure domain logic, shared contracts, database repositories, the backend API, and the Nuxt frontend.

| Layer | Technology | Responsibility |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | **Bun** | Workspace manager, test runner, and production runtime. |
| **Frontend (`apps/web`)** | **Nuxt 4 + Vue 3 + Tailwind CSS** | Mobile-first responsive web app, SSR for song pages. (Explicitly avoiding Next.js). |
| **Backend (`apps/api`)** | **ElysiaJS (on Bun)** | Type-safe REST API, Lyrica proxy gateway, rate limiter, and song management. |
| **Core Domain (`packages/core`)** | **Pure TypeScript (OOP)** | Framework-agnostic business logic (Sync Engine, Gap Generator, Lyrica Normalizer, Auto-Pause). |
| **Database (`packages/db`)** | **Drizzle ORM** | Supports **SQLite (`bun:sqlite` / libSQL)** for zero-config self-hosting and **PostgreSQL** for scale. |
| **Contracts (`packages/contracts`)** | **Zod / TypeBox** | Shared request/response DTOs and Versioned Lyric JSON Schema. |

### Monorepo Directory Layout

```text
.
├── AGENTS.md                       # Concise operational rules for AI agents
├── PLANNING.md                     # This architectural blueprint
├── PROGRESS.md                     # Single source-of-truth progress & handoff log
├── README.md                       # Project overview & self-hosting guide
├── lyrica-docs/ (or LYRICA_DOCS.md)# Local Lyrica documentation (MUST be checked by AI agents)
├── apps/
│   ├── api/                        # ElysiaJS HTTP Server
│   │   ├── src/
│   │   │   ├── controllers/        # Thin HTTP route handlers (max 100 lines/file)
│   │   │   ├── services/           # Application use-cases (orchestration only)
│   │   │   ├── middlewares/        # Rate limit, Turnstile verify, error handler
│   │   │   ├── gateways/           # External HTTP clients (LyricaGateway, YouTubeOEmbed)
│   │   │   └── index.ts
│   │   └── Dockerfile
│   └── web/                        # Nuxt 4 Frontend
│       ├── app/
│       │   ├── components/
│       │   │   ├── ui/             # Pure atomic UI (Button, Modal, Slider)
│       │   │   ├── player/         # YouTube & Lyrics display components
│       │   │   ├── game/           # WriteInput, ChoiceGrid, ScoreBar
│       │   │   └── studio/         # TapSyncPad, WordTimingRow, OffsetControl
│       │   ├── composables/        # Thin Vue reactivity bridges to packages/core
│       │   ├── features/           # Smart container components per feature domain
│       │   └── pages/              # File-based routing (minimal logic)
│       └── Dockerfile
├── packages/
│   ├── contracts/                  # Shared DTOs & JSON Lyric Schema v1
│   ├── core/                       # Pure OOP Domain Logic & Engines (100% unit-testable)
│   │   └── src/
│   │       ├── domain/             # Entities & Value Objects (TimestampMs, LyricLine, WordToken)
│   │       ├── normalization/      # Strategy pattern for Lyrica JSON -> Internal Schema
│   │       ├── sync/               # SyncClockEngine, TapSyncRecorder, OffsetCalculator
│   │       ├── gameplay/           # GapGenerator, AnswerValidator, AutoPauseController
│   │       └── transliteration/    # TransliterationResolver (Lyrica-first + fallback)
│   └── db/                         # Drizzle schema, migrations, & Repository implementations
├── docker/                         # Optional reverse proxy configs & entrypoint scripts
├── docker-compose.yml              # Production / Self-host stack
├── docker-compose.dev.yml          # Local development stack
├── .env.example
└── package.json                    # Bun workspace root
```

---

## 4. Strict Coding Rules: OOP, Component Architecture & No Godmode Policy

All contributors and AI agents **MUST** strictly enforce these rules to keep the codebase modular, readable, and testable.

### 4.1. **NO GODMODE** Policy (Anti-God Object / Anti-God Component)
Files, classes, functions, or Vue components that attempt to handle multiple unrelated responsibilities are strictly forbidden.

| Metric | Hard Limit | Mandatory Action If Exceeded |
| :--- | :--- | :--- |
| **File Length (TS / Vue SFC)** | Max **200 lines** | Split into focused sub-modules, sub-components, or helper classes. |
| **Class Size (OOP)** | Max **150 lines**, max **7 public methods** | Extract collaborating classes or apply Strategy/State patterns. |
| **Method / Function Length** | Max **35 lines** | Extract descriptive private methods. |
| **Parameter Count** | Max **4 parameters** | Group into a typed Config/Parameter Object interface. |
| **Nesting Depth (`if`/`for`)** | Max **3 levels** | Flatten using guard clauses / early returns. |
| **Dumping-Ground Files** | **FORBIDDEN** (`utils.ts`, `helpers.ts`, `common.ts`, `GameManager.ts`) | Name files explicitly by domain responsibility (e.g., `TextNormalizer.ts`, `TimeFormatter.ts`). |

### 4.2. OOP Rules (`packages/core` & `apps/api`)
Core business logic **must** be written in pure **Object-Oriented Programming (OOP)** inside `packages/core` with **zero** imports from Vue, Nuxt, or Elysia.

1. **Single Responsibility Principle (SRP) per Engine:**
   Never bundle gameplay into a monolithic `GameEngine`. Compose small, collaborating classes:
   * `SyncClockEngine`: Resolves the active line and active word from `currentTimeMs` and `globalOffsetMs`.
   * `GapGenerator`: Selects hidden words based on `DifficultyLevel` and deterministic/random seeding.
   * `AnswerValidator`: Normalizes and validates user input (case-insensitive, optional punctuation/diacritic tolerance).
   * `AutoPauseController`: Monitors the `endMs` boundary of an unsolved active gap and emits a `pause` trigger.
   * `TapSyncRecorder`: Captures real-time tap/spacebar press-and-release timestamps in the authoring studio.
2. **Strategy Pattern for Lyrica Normalization:**
   Because Lyrica supports multi-level sync degradation (`word` $\rightarrow$ `line` $\rightarrow$ `plain`), giant `if/else` chains are forbidden. Implement `ILyricsNormalizationStrategy` with dedicated classes:
   * `WordSyncedLyricaStrategy`
   * `LineSyncedLyricaStrategy`
   * `PlainTextLyricaStrategy`
3. **Dependency Inversion Principle (DIP):**
   * `packages/core` and `apps/api/src/services` must depend only on **Interfaces (Ports)** (`ISongRepository`, `ILyricaGateway`, `ITransliterationProvider`), never concrete drivers or HTTP clients.
   * This guarantees effortless SQLite $\leftrightarrow$ PostgreSQL switching and fast unit testing.
4. **Encapsulation & Value Objects:**
   * Protect internal state using `private`/`readonly` fields.
   * Never mutate lyric arrays directly from outside a domain object; expose explicit domain methods (e.g., `songTiming.applyGlobalOffset(deltaMs)`, `wordToken.adjustBounds(startMs, endMs)`).
5. **No Static-Only Utility Classes:**
   * Avoid classes made entirely of `static` methods wrapping procedural code. Use instantiated classes with constructor dependency injection.

### 4.3. Component Architecture Rules (`apps/web`)
The Nuxt 4 frontend must enforce a strict separation between **Presentation (UI)**, **Reactivity (Composables)**, and **Domain Logic (`packages/core`)**.

1. **3-Tier Component Hierarchy:**
   * **Tier 1 — Presentational / Dumb Components (`components/ui/`, `components/player/`, `components/game/`, `components/studio/`):**
     * Accept `props` and emit `events` only.
     * **FORBIDDEN** from making API calls (`$fetch`/`useFetch`), reading `localStorage`, or instantiating backend services.
   * **Tier 2 — Feature Containers (`features/`):**
     * Wire composables to presentational components and manage feature-level layout/state flow.
   * **Tier 3 — Pages (`pages/`):**
     * **Ultra-thin** (max 60 lines). Handle route parameters, `useHead()` SEO metadata, and render a single container from `features/`.
2. **Thin SFC Rule:**
   * All `.vue` files must use `<script setup lang="ts">`.
   * If `<script setup>` exceeds **80 lines**, extract reactive state and coordination into a dedicated composable (e.g., `useSyncStudio.ts`, `useGameplaySession.ts`).
   * Composables must **not** contain heavy algorithms; they act as reactive adapters around class instances from `packages/core`.
3. **Mobile-First & Keyboard-Safe UX:**
   * Design and verify every view for mobile viewports (`360px` – `430px`).
   * On mobile gameplay screens, keep the YouTube player compact and sticky at the top so the virtual keyboard never obscures the active lyric line or input field.

---

## 5. Lyrica Integration (`https://lyrica.collei.my.id/`)

> **AI Agent Reminder:** Always verify exact query parameters, headers, error codes, and JSON field names against the **root-level Lyrica documentation** before implementing `LyricaGateway` or normalization strategies.

### Normalization & Transliteration Pipeline
1. `LyricaGateway` proxies requests from `apps/api` to `LYRICA_BASE_URL` (avoiding browser CORS issues, enabling server-side caching, and enforcing rate limits).
2. Request word-level timestamps and romanization/transliteration by default (as supported by the local Lyrica docs).
3. `LyricsNormalizer` inspects the sync level returned by Lyrica and delegates to the matching `ILyricsNormalizationStrategy`:
   * **Word-level** $\rightarrow$ maps directly to internal `WordToken` bounds.
   * **Line-level** $\rightarrow$ tokenizes each line into words with proportional initial timing estimates ready for Tap-to-Sync refinement.
   * **Plain text** $\rightarrow$ tokenizes lines and words with `null` timestamps, flagging the track for manual synchronization.
4. **Lyrica-First Transliteration Fallback:**
   * `TransliterationResolver` checks whether Lyrica already returned transliteration/romanization data.
   * If **present**, populate the Studio transliteration fields directly for uploader verification/editing.
   * If **absent**, expose an **"Auto-Transliterate"** action in the Studio backed by lightweight local providers (e.g., romaji for Japanese, `pinyin-pro` for Chinese, `transliteration` for Cyrillic/others), allowing full manual line-by-line editing afterward.

---

## 6. Database Schema & Data Contracts

### Internal `lyrics_data` JSON Schema (Contract v1)

```json
{
  "version": 1,
  "source": "lyrica",
  "syncLevel": "word",
  "hasTransliteration": true,
  "lines": [
    {
      "id": "l_001",
      "startMs": 36189,
      "endMs": 37719,
      "text": "Look at the stars",
      "transliteration": null,
      "words": [
        {
          "id": "w_001",
          "text": "Look",
          "startMs": 36189,
          "endMs": 36520,
          "isGapEligible": true
        },
        {
          "id": "w_002",
          "text": "at",
          "startMs": 36520,
          "endMs": 36800,
          "isGapEligible": false
        }
      ]
    }
  ]
}
```

### Drizzle ORM Tables (`packages/db`)

1. **`songs`**
   * `id` (TEXT/UUID, PK)
   * `youtube_id` (TEXT, indexed)
   * `title` (TEXT)
   * `artist` (TEXT)
   * `language_code` (TEXT, ISO 639-1, e.g. `en`, `ja`, `ko`, `fr`)
   * `video_start_ms` (INTEGER, default `0`)
   * `video_end_ms` (INTEGER, nullable)
   * `global_offset_ms` (INTEGER, default `0`)
   * `lyrics_data` (JSON / JSONB)
   * `edit_token_hash` (TEXT, SHA-256 hash enabling token-based editing without accounts)
   * `play_count` (INTEGER, default `0`)
   * `created_at`, `updated_at` (TIMESTAMP)

2. **`song_revisions`**
   * `id` (TEXT/UUID, PK)
   * `song_id` (FK $\rightarrow$ `songs.id`, `ON DELETE CASCADE`)
   * `lyrics_data_snapshot` (JSON / JSONB)
   * `change_note` (TEXT)
   * `created_at` (TIMESTAMP)

---

## 7. Core Feature Flows

### 7.1. Authoring & Word-Level Sync Studio
1. **YouTube Input:** Uploader pastes a YouTube URL/ID. Video loads via IFrame Player and metadata is fetched via YouTube oEmbed.
2. **Lyrica Fetch & Confirm:** Backend queries `lyrica.collei.my.id`, shows sync status (`Word-Synced` / `Line-Synced` / `Plain`), and lets the uploader confirm the right lyric match.
3. **Video Trim & Global Offset:** Uploader sets `video_start_ms` (skip intro), `video_end_ms` (skip outro), and adjusts `global_offset_ms` (`+/- 50ms` to `+/- 5000ms`).
4. **Word-Level Sync & Wording Editor:**
   * **Tap-to-Sync Mode:** Supports variable playback speed (`0.5x`, `0.75x`, `1x`). Uploader taps `Spacebar` or an on-screen pad to record `startMs`/`endMs` per word.
   * **Fine-Tune & Wording:** Click any word to fix typos, split/merge tokens, nudge timestamps (`-50ms`/`+50ms`), or toggle `isGapEligible`.
   * **Transliteration Panel:** Review Lyrica's transliteration or trigger fallback auto-transliteration with manual per-line editing.

### 7.2. Gameplay Engine
* **Sync Loop:** Uses `requestAnimationFrame` polling `player.getCurrentTime() * 1000` into `SyncClockEngine` for smooth word-level highlighting.
* **Game Modes:**
  * **Write Mode:** Type missing words with smart normalization.
  * **Choice Mode:** 4 multiple-choice options (1 correct answer + 3 distractors generated from the song's vocabulary).
* **Difficulty Levels:** Beginner (`10%`), Intermediate (`25%`), Advanced (`50%`), Expert (`100%`).
* **Auto-Pause (Default: Enabled):**
  * Stored in `localStorage` (`YoursTruly:prefs.autoPause = true`).
  * Toggleable anytime in the gameplay UI.
  * **Replay Line** button (shortcut `Tab` / `Backspace`) seeks back to `currentLine.startMs - 500ms`.

---

## 8. Security & Anti-Abuse (No-Auth Architecture)

1. **Cloudflare Turnstile:** Required on write endpoints (`POST /api/songs`, `PUT /api/songs/:id`). Configurable via `TURNSTILE_ENABLED=false` for private self-hosting.
2. **Rate Limiting:** Per-IP throttling on Lyrica proxy endpoints (e.g., 15 req/min) and song submission endpoints (e.g., 5 req/min).
3. **Secret Edit Token:** On song creation, the server generates a random `edit_token`, stores its SHA-256 hash in `songs.edit_token_hash`, and returns the raw token once to the uploader (saved in browser `localStorage` with a copyable secret edit link).
4. **Revision Snapshots:** Every edit appends a snapshot to `song_revisions` for safe rollback.
5. **Input Validation & Sanitization:** Strict Zod/TypeBox validation, max `64KB` lyric JSON payload size, and full XSS escaping on all lyric and transliteration text.

---

## 9. Self-Hosting & Docker Architecture

Designed for effortless single-command self-hosting.

### Container Design
* **`api` (`apps/api/Dockerfile`):** Multi-stage build on `oven/bun:1-alpine`, non-root user, port `4000`, built-in `/health` healthcheck, auto-runs Drizzle migrations on boot.
* **`web` (`apps/web/Dockerfile`):** Multi-stage build on `oven/bun:1-alpine`, non-root user, runs Nuxt Nitro server on port `3000`.
* **Database Modes (ENV Configurable):**
  * **Default (SQLite):** Persisted in Docker volume `/data/YoursTruly.db`—ideal for lightweight VPS or home servers.
  * **Optional PostgreSQL:** Enabled via Docker Compose profile (`--profile postgres`).

### `docker-compose.yml` Blueprint

```yaml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DB_DRIVER=${DB_DRIVER:-sqlite}
      - DATABASE_URL=${DATABASE_URL:-file:/data/YoursTruly.db}
      - LYRICA_BASE_URL=${LYRICA_BASE_URL:-https://lyrica.collei.my.id}
      - TURNSTILE_ENABLED=${TURNSTILE_ENABLED:-false}
      - TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY:-}
    volumes:
      - YoursTruly_data:/data
    healthcheck:
      test: ["CMD", "bun", "-e", "fetch('http://localhost:4000/health').then(r => process.exit(r.ok ? 0 : 1))"]
      interval: 30s
      timeout: 5s
      retries: 3

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    depends_on:
      api:
        condition: service_healthy
    environment:
      - NUXT_PUBLIC_API_BASE=${PUBLIC_API_BASE:-http://localhost:4000}
      - NUXT_API_INTERNAL_URL=http://api:4000
      - NUXT_PUBLIC_TURNSTILE_SITE_KEY=${TURNSTILE_SITE_KEY:-}
    ports:
      - "${APP_PORT:-3000}:3000"

  postgres:
    image: postgres:16-alpine
    profiles: ["postgres"]
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-YoursTruly}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-YoursTruly_secret}
      - POSTGRES_DB=${POSTGRES_DB:-YoursTruly}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  YoursTruly_data:
  postgres_data:
```

---

## 10. Development Roadmap (MVP Milestones)

### Phase 0: Repository Bootstrap & Agent Handoff Setup
- [ ] Run `git init` and add `.gitignore`.
- [ ] Read root-level Lyrica documentation to confirm exact API contract.
- [ ] Create `AGENTS.md`, `README.md`, and `PROGRESS.md`.
- [ ] Make initial Git commit.

### Phase 1: Monorepo Foundation & Core Domain (OOP)
- [ ] Initialize Bun Workspaces (`apps/web`, `apps/api`, `packages/core`, `packages/db`, `packages/contracts`).
- [ ] Configure Biome/ESLint rules enforcing the No Godmode Policy (max lines, complexity, nesting depth).
- [ ] Build `packages/core`: Value Objects, `ILyricsNormalizationStrategy` (Word/Line/Plain), `SyncClockEngine`, `GapGenerator`, `AnswerValidator`, `AutoPauseController`, `TapSyncRecorder`, and `TransliterationResolver` with `bun test` unit coverage.
- [ ] Configure Drizzle ORM schema, migrations, and repository interfaces in `packages/db`.

### Phase 2: Backend API & Lyrica Integration
- [ ] Implement `LyricaGateway` verified against root-level Lyrica docs (`https://lyrica.collei.my.id/`).
- [ ] Build song CRUD endpoints (`POST /api/songs`, `GET /api/songs`, `GET /api/songs/:id`, `PUT /api/songs/:id` with `edit_token` verification).
- [ ] Add rate-limiting middleware and configurable Cloudflare Turnstile verification.

### Phase 3: Authoring & Word-Level Sync Studio (`apps/web`)
- [ ] Build YouTube IFrame Player wrapper component.
- [ ] Build Studio flow: YouTube URL input $\rightarrow$ Lyrica search/confirm $\rightarrow$ Start/End trim & Global Offset.
- [ ] Build Tap-to-Sync Word Editor, inline wording editor, and Lyrica-first transliteration panel with fallback button.

### Phase 4: Gameplay Engine, Mobile Polish & Docker Self-Hosting
- [ ] Build gameplay screens: Write Mode, Choice Mode, Difficulty selector, Auto-Pause (default ON), and Replay Line.
- [ ] Polish mobile-first sticky player and virtual-keyboard-safe layout.
- [ ] Finalize `Dockerfile`s, `docker-compose.yml`, auto-migrations on startup, and self-hosting docs in `README.md`.
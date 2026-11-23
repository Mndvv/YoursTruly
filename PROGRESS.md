# PROGRESS.md — Single Source of Truth

## Current State
- **Current Phase:** Phase 3: Authoring & Word-Level Sync Studio & Phase 4: Gameplay Engine & Docker Self-Hosting [COMPLETED]
- **Active Task:** All planned MVP milestones completed and verified
- **Last Updated:** 2026-11-23

---

## Roadmap & Milestones Checklist

### Phase 0: Repository Bootstrap & Agent Handoff Setup
- [x] Run `git init` and configure `.gitignore` (Commit `944ae2d`)
- [x] Read and inspect root-level Lyrica documentation (`lyrica-docs/`)
- [x] Copy project planning guidelines to `PLANNING.md`
- [x] Create `AGENTS.md` (distilled AI agent instructions & No Godmode rules)
- [x] Create `README.md` (project overview, stack, environment variables, self-hosting guide)
- [x] Create `.env.example`
- [x] Create `PROGRESS.md` (single-file progress tracking)
- [x] Initial Git commit: `chore: bootstrap project docs, agent guidelines, and progress tracker` (Commit `944ae2d`)
- [x] Enforce real-time PROGRESS.md updates rule (Commit `8c68a5c`)

### Phase 1: Monorepo Foundation & Core Domain (OOP)
- [x] Initialize Bun Workspaces (`package.json` with `apps/*`, `packages/*`)
- [x] Configure Biome (`biome.json`), TypeScript base config (`tsconfig.base.json`)
- [x] Scaffold `packages/contracts`:
  - [x] Lyric JSON Schema v1 (Zod)
  - [x] DTOs for Song, Revisions, Lyrica Proxy responses, YouTube metadata
- [x] Scaffold `packages/core` (Pure OOP, 0 framework dependencies):
  - [x] Domain Entities & Value Objects (`TimestampMs`, `LyricLine`, `WordToken`, `SongLyrics`)
  - [x] Strategy Pattern for Lyrica Normalization (`WordSyncedLyricaStrategy`, `LineSyncedLyricaStrategy`, `PlainTextLyricaStrategy`, `LyricsNormalizer`)
  - [x] `SyncClockEngine` (active line & word timing calculator)
  - [x] `GapGenerator` (difficulty-based gap mask generation)
  - [x] `AnswerValidator` (normalized comparison, unicode diacritic tolerance)
  - [x] `AutoPauseController` (pause trigger at unsolved gap end boundary)
  - [x] `TapSyncRecorder` (press/release recorder for Studio authoring)
  - [x] `ChoiceDistractorGenerator` (distractor generation for Choice Mode)
  - [x] `TransliterationResolver` (Lyrica-first + local fallback)
  - [x] Comprehensive unit tests with `bun test` (23 passing tests)
- [x] Scaffold `packages/db`:
  - [x] Drizzle ORM schema for `songs` and `song_revisions` (SQLite + PostgreSQL schemas)
  - [x] Repository interfaces (`ISongRepository`) and SQLite implementation (`SqliteSongRepository`)
  - [x] Database connection helper with WAL mode & auto table creation
  - [x] Repository unit tests (3 passing tests)
- [x] Commit Phase 1 (Commit `6e1e471`)

### Phase 2: Backend API & Lyrica Integration (`apps/api`)
- [x] Implement `LyricaGateway` communicating with `https://lyrica.collei.my.id/`
- [x] Implement YouTube oEmbed metadata fetcher (`YouTubeGateway`)
- [x] Token hash and verification service (`TokenHashService` with constant-time SHA-256)
- [x] Song CRUD application service (`SongService`)
- [x] Thin Elysia controllers (`/api/lyrics`, `/api/youtube`, `/api/songs`)
- [x] Rate-limiting middleware (`RateLimitGuard`) and Cloudflare Turnstile verification (`TurnstileGuard`)
- [x] Elysia standalone application entrypoint with Swagger and CORS (`apps/api/src/index.ts`)
- [x] Multi-stage `apps/api/Dockerfile`
- [x] API Integration and gateway unit tests (5 passing tests, total monorepo: 31 passing tests)
- [x] Commit Phase 2 (Commit `3e12897`)

### Phase 3: Authoring & Word-Level Sync Studio (`apps/web`)
- [x] Initialize Nuxt 4 application with Tailwind CSS in `apps/web`
- [x] Tier 1 Presentational Components (`AppButton`, `AppHeader`, `YouTubePlayer`, `LyricDisplay`, `TapSyncPad`, `OffsetControl`, `WordTimingRow`)
- [x] Composables (`useYouTubePlayer`, `useSyncStudio`, `useGameplaySession`)
- [x] Tier 2 Containers (`SyncStudioContainer.vue`, `SongCatalogContainer.vue`)
- [x] Tier 3 Thin Pages (`pages/index.vue`, `pages/studio.vue`, `pages/game/[id].vue`)
- [x] Secret edit token persistence in `localStorage`

### Phase 4: Gameplay Engine, Mobile Polish & Docker Self-Hosting
- [x] Gameplay components (`WriteInput`, `ChoiceGrid`, `ScoreBar`, `GameplayContainer`)
- [x] Difficulty levels: Beginner (10%), Intermediate (25%), Advanced (50%), Expert (100%)
- [x] Auto-pause at unsolved gap boundary with `Tab` / `Backspace` replay trigger
- [x] Mobile-first layout with sticky video player and virtual-keyboard-safe spacing
- [x] Multi-stage `apps/web/Dockerfile` with non-root user and Nitro server
- [x] `docker-compose.yml` (SQLite default with optional PostgreSQL via `--profile postgres`)
- [x] `docker-compose.dev.yml` for local container testing
- [x] Verified full production bundle generation (`nuxt build` succeeded)

---

## Architectural Decisions & Deviations

1. **Bun as Monorepo Package Manager:** Workspaces managed cleanly at root level (`apps/*`, `packages/*`).
2. **Pure OOP in `packages/core`:** Zero framework dependencies for rock-solid unit testing and platform portability.
3. **No Godmode Discipline:** Maximum 200 lines per file, 150 lines per class, 35 lines per method, 3 levels of nesting. No dumping grounds like `utils.ts`.
4. **Unicode Property Escapes in `AnswerValidator`:** Used `\p{Diacritic}` regex replacement to comply with Biome's `noMisleadingCharacterClass` and accurately strip combining characters across language scripts.
5. **Constant-time Token Verification:** `TokenHashService` uses SHA-256 and `crypto.timingSafeEqual` to prevent timing attacks on edit token verification.
6. **Graceful Lyrica Gateway Fallback:** `LyricaGateway` catches network/server timeouts and returns typed error envelopes matching the API schema rather than unhandled rejections.
7. **3-Tier Vue Architecture:** Strict separation between Dumb Presentational components (Tier 1), Feature Containers (Tier 2), and Ultra-Thin Routing Pages (Tier 3).

---

## Known Issues / Blockers

- None. All 31 unit & integration tests passing. Nuxt 4 production build verified (`nuxt build`). Biome formatting and linting clean.

---

## Exact Next Step

1. Repository is fully scaffolded, verified, and ready for development server execution (`bun run dev`) or container launch (`docker compose up -d`).
- [ ] Gameplay screens:
  - [ ] Write Mode & Choice Mode
  - [ ] Difficulty selector (Beginner 10%, Intermediate 25%, Advanced 50%, Expert 100%)
  - [ ] Real-time sync highlight with `SyncClockEngine`
  - [ ] Auto-Pause toggle & Replay Line keyboard shortcut (`Tab` / `Backspace`)
- [ ] Mobile-first responsive layout (sticky video, virtual-keyboard-safe viewports)
- [ ] Multi-stage `Dockerfile` (`apps/web/Dockerfile`)
- [ ] `docker-compose.yml` with SQLite default and `--profile postgres`

---

## Architectural Decisions & Deviations

1. **Bun as Monorepo Package Manager:** Workspaces managed cleanly at root level (`apps/*`, `packages/*`).
2. **Pure OOP in `packages/core`:** Zero framework dependencies for rock-solid unit testing and platform portability.
3. **No Godmode Discipline:** Maximum 200 lines per file, 150 lines per class, 35 lines per method, 3 levels of nesting. No dumping grounds like `utils.ts`.
4. **Unicode Property Escapes in `AnswerValidator`:** Used `\p{Diacritic}` regex replacement to comply with Biome's `noMisleadingCharacterClass` and accurately strip combining characters across language scripts.
5. **Constant-time Token Verification:** `TokenHashService` uses SHA-256 and `crypto.timingSafeEqual` to prevent timing attacks on edit token verification.
6. **Graceful Lyrica Gateway Fallback:** `LyricaGateway` catches network/server timeouts and returns typed error envelopes matching the API schema rather than unhandled rejections.

---

## Known Issues / Blockers

- None. All 31 unit & integration tests passing. Biome formatting and linting clean.

---

## Exact Next Step

1. Commit Phase 2: `feat(api): ElysiaJS REST API, Lyrica gateway, YouTube oEmbed, and song CRUD with edit token auth`.
2. Scaffold `apps/web` (Nuxt 4 + Tailwind CSS) with 3-tier component architecture.
- [ ] Initialize Nuxt 4 application with Tailwind CSS
- [ ] YouTube IFrame player wrapper component
- [ ] Authoring studio workflow:
  - [ ] Step 1: YouTube URL input & metadata fetch
  - [ ] Step 2: Lyrica lyrics query & candidate selection
  - [ ] Step 3: Video boundary trimming (start/end) and global offset adjuster
  - [ ] Step 4: Tap-to-Sync word recorder & timing fine-tuner
  - [ ] Step 5: Transliteration reviewer / fallback generator
  - [ ] Step 6: Song submission with secret edit token storage in `localStorage`

### Phase 4: Gameplay Engine, Mobile Polish & Docker Self-Hosting
- [ ] Gameplay screens:
  - [ ] Write Mode & Choice Mode
  - [ ] Difficulty selector (Beginner 10%, Intermediate 25%, Advanced 50%, Expert 100%)
  - [ ] Real-time sync highlight with `SyncClockEngine`
  - [ ] Auto-Pause toggle & Replay Line keyboard shortcut (`Tab` / `Backspace`)
- [ ] Mobile-first responsive layout (sticky video, virtual-keyboard-safe viewports)
- [ ] Multi-stage `Dockerfile`s (`apps/api/Dockerfile`, `apps/web/Dockerfile`)
- [ ] `docker-compose.yml` with SQLite default and `--profile postgres`

---

## Architectural Decisions & Deviations

1. **Bun as Monorepo Package Manager:** Workspaces managed cleanly at root level (`apps/*`, `packages/*`).
2. **Pure OOP in `packages/core`:** Zero framework dependencies for rock-solid unit testing and platform portability.
3. **No Godmode Discipline:** Maximum 200 lines per file, 150 lines per class, 35 lines per method, 3 levels of nesting. No dumping grounds like `utils.ts`.
4. **Unicode Property Escapes in `AnswerValidator`:** Used `\p{Diacritic}` regex replacement to comply with Biome's `noMisleadingCharacterClass` and accurately strip combining characters across language scripts.

---

## Known Issues / Blockers

- None. All 26 unit tests passing. Biome linting clean.

---

## Exact Next Step

1. Implement `LyricaGateway` in `apps/api/src/gateways/LyricaGateway.ts`.
2. Implement YouTube oEmbed fetcher in `apps/api/src/gateways/YouTubeGateway.ts`.
3. Implement `SongService` and Elysia controllers for Song CRUD and Lyrica proxy.

# PROGRESS.md — Single Source of Truth

## Current State
- **Current Phase:** Phase 1: Monorepo Foundation & Core Domain (OOP) [COMPLETED] -> Phase 2: Backend API & Lyrica Integration (`apps/api`)
- **Active Task:** Implement Backend API with ElysiaJS, LyricaGateway, and Song CRUD
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

### Phase 2: Backend API & Lyrica Integration (`apps/api`)
- [ ] Setup ElysiaJS application on Bun
- [ ] Implement `LyricaGateway` communicating with `https://lyrica.collei.my.id/`
- [ ] Implement YouTube oEmbed metadata fetcher
- [ ] Song CRUD endpoints (`POST /api/songs`, `GET /api/songs`, `GET /api/songs/:id`, `PUT /api/songs/:id`)
- [ ] Secret edit token generation and SHA-256 verification
- [ ] Rate-limiting and Cloudflare Turnstile verification middleware

### Phase 3: Authoring & Word-Level Sync Studio (`apps/web`)
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

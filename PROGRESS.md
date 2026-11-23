# PROGRESS.md — Single Source of Truth

## Current State
- **Current Phase:** Phase 0: Repository Bootstrap & Agent Handoff Setup (Wrapping up) $\rightarrow$ Phase 1: Monorepo Foundation & Core Domain (OOP)
- **Active Task:** Initialize Bun Workspaces and scaffold package/app structure
- **Last Updated:** 2026-11-23

---

## Roadmap & Milestones Checklist

### Phase 0: Repository Bootstrap & Agent Handoff Setup
- [x] Run `git init` and configure `.gitignore`
- [x] Read and inspect root-level Lyrica documentation (`lyrica-docs/`)
- [x] Copy project planning guidelines to `PLANNING.md`
- [x] Create `AGENTS.md` (distilled AI agent instructions & No Godmode rules)
- [x] Create `README.md` (project overview, stack, environment variables, self-hosting guide)
- [x] Create `.env.example`
- [x] Create `PROGRESS.md` (single-file progress tracking)
- [ ] Initial Git commit: `chore: bootstrap project docs, agent guidelines, and progress tracker`

### Phase 1: Monorepo Foundation & Core Domain (OOP)
- [ ] Initialize Bun Workspaces (`package.json` with `apps/*`, `packages/*`)
- [ ] Configure Biome/ESLint & TypeScript compiler configs for monorepo
- [ ] Scaffold `packages/contracts`:
  - [ ] Lyric JSON Schema v1 (Zod / TypeBox)
  - [ ] DTOs for Song, Revisions, Lyrica Proxy responses
- [ ] Scaffold `packages/core`:
  - [ ] Domain Entities & Value Objects (`TimestampMs`, `LyricLine`, `WordToken`)
  - [ ] Strategy Pattern for Lyrica Normalization (`WordSyncedLyricaStrategy`, `LineSyncedLyricaStrategy`, `PlainTextLyricaStrategy`)
  - [ ] `SyncClockEngine` (active line & word timing calculator)
  - [ ] `GapGenerator` (difficulty-based gap mask generation)
  - [ ] `AnswerValidator` (normalized comparison, punctuation/diacritic tolerance)
  - [ ] `AutoPauseController` (pause trigger at unsolved gap end boundary)
  - [ ] `TapSyncRecorder` (press/release recorder for Studio authoring)
  - [ ] `TransliterationResolver` (Lyrica-first + local fallback)
  - [ ] Comprehensive unit tests with `bun test`
- [ ] Scaffold `packages/db`:
  - [ ] Drizzle ORM schema for `songs` and `song_revisions` (SQLite + PostgreSQL support)
  - [ ] Repository interfaces (`ISongRepository`) and implementations

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

---

## Known Issues / Blockers

- None currently. Environment has Bun v1.2.20 and Git installed.

---

## Exact Next Step

1. Commit Phase 0 bootstrap files (`chore: bootstrap project docs, agent guidelines, and progress tracker`).
2. Proceed to Phase 1: Create root `package.json` for Bun workspaces, `tsconfig.base.json`, and Biome configuration.

# PROGRESS.md — Single Source of Truth

## Current State
- **Current Phase:** Verse-Loop Auto-Submit on Rewind & Keyboard Debounce / Chatter Prevention [COMPLETE]
- **Active Task:** All unit tests, Biome linting, and build verification completed. Ready for commit.
- **Last Updated:** 2026-11-24

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
  - [x] Unit tests with `bun test` (23 passing tests)
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
- [x] `YouTubeTitleCleaner` integrating smart noise removal for video titles (e.g. `(Official Lyric Video) | ...`)
- [x] Multi-Candidate lyrics search (`GET /api/lyrics/candidates` using Lyrica `/suggestion?q=...`)
- [x] Interactive lyric candidate picker with sync level and sample lyric preview
- [x] Manual paste and custom LRC input fallback in Studio

### Phase 4: Gameplay Engine, Mobile Polish & Docker Self-Hosting
- [x] Gameplay components (`WriteInput`, `ChoiceGrid`, `ScoreBar`, `GameplayContainer`)
- [x] Difficulty levels: Beginner (10%), Intermediate (25%), Advanced (50%), Expert (100%)
- [x] Auto-pause at unsolved gap boundary with `Tab` / `Backspace` replay trigger
- [x] Mobile-first layout with sticky video player and virtual-keyboard-safe spacing
- [x] Multi-stage `apps/web/Dockerfile` with non-root user and Nitro server
- [x] `docker-compose.yml` (SQLite default with optional PostgreSQL via `--profile postgres`)
- [x] Direct runner in `scripts/dev.ts` running API + Web concurrently on `bun run dev`
- [x] Unified `bun run build` building both API and Web bundles cleanly
- [x] Fixed Lyrica `timed_lyrics` payload integration in sync strategies
- [x] Resolved Lyrica Groq romanize requirement causing 500 error on self-hosted instances without Groq keys
- [x] Fix `w.isEligibleForGap` TypeError by supporting plain `WordTokenData` and factory methods in `WordToken`, `LyricLine`, and `SongLyrics`
- [x] Support plain JSON objects across `GapGenerator`, `ChoiceDistractorGenerator`, `AutoPauseController`, and `SyncClockEngine`
- [x] Create `LyricTimingShifter` pure OOP engine for full-track alignment and timestamp shifting while preserving intervals
- [x] Add Live Lyrics Sync Preview under YouTube player during Studio sync playback
- [x] Add `TrackAlignmentControl` component with "Align all lyrics to current time" and ±1s / ±5s track shifting
- [x] Extract `LyricCandidatePicker` presentational component to keep `SyncStudioContainer` < 180 lines
- [x] Create `PreGameLobby.vue` setup screen to choose Mode (Write vs Choice), Difficulty (Beginner 10%, Intermediate 25%, Advanced 50%, Expert 100%), and Auto-Pause before starting playback
- [x] Mask unsolved gaps in `LyricDisplay.vue` with interactive pulsing dashed blanks `✏️ _ _ _ _`
- [x] Highlight solved gaps in emerald green upon correct answer
- [x] Wire YouTube player pause/play and auto-pause pause/resume upon answering
- [x] Add Replay Line (`Tab` / button) to seek back to start of current line when stuck
- [x] Add track deletion button `🗑️` on song cards in `SongCatalogContainer.vue`

### Phase 5: LingoClip Style Playback, Verse Rewind, Word Suggestions & Scorer (Commit `2be781e`)
- [x] **AutoPauseController Pause Modes:**
  - Added `PauseMode = "strict" | "verse_loop" | "continuous"`.
  - Fixed pause timing window: `currentTimeMs >= endMs - 60` ensures pause is never skipped due to frame-rate intervals.
  - Implemented `checkVerseRewind(lineId, lineStartMs, lineEndMs, unsolvedCount, effectiveMs)` to rewind automatically when a verse ends with unsolved gaps.
- [x] **WordHintHelper Engine:**
  - Created pure OOP `WordHintHelper.ts` (49 lines).
  - Progressive letter reveals for Write Mode (`getLetterHint(word, level)`).
  - 50/50 distractor elimination for Choice Mode (`get5050Choices(target, choices)`).
- [x] **GameplayScorer Engine:**
  - Created pure OOP `GameplayScorer.ts` (48 lines).
  - Tracks points, streaks, `successCount`, `failCount`, and live accuracy percentage.
- [x] **Pre-Game Lobby Preferences:**
  - Added 3 interactive pause preference cards:
    - 🔁 **Verse Loop:** Continuous singing; rewinds to start of verse if any words are missed.
    - 🛑 **Strict Pause:** Pauses video immediately at every missing word.
    - ▶️ **Continuous:** Keeps playing without stopping; uncompleted words count as missed.
- [x] **In-Game Help & Hints:**
  - Added `💡 Hint` button (shortcuts `Ctrl` / `F1`) revealing letters in Write Mode.
  - Added `💡 50/50 Hint` button eliminating 2 incorrect options in Choice Mode.
  - Strikethrough red styling for failed words in `LyricDisplay.vue` and red error flash for wrong inputs.
  - Live ScoreBar displaying ✅ Passed, ❌ Failed, and Accuracy %, plus clickable Pause Mode cycle toggle.
- [x] **Comprehensive Testing:**
  - Added unit tests in `packages/core/test/gameplay.test.ts` for strict pause, verse rewind, letter reveals, and 50/50 distractors (44 tests passing).
  - Biome check passing 0 errors across 96 files. Full monorepo build verified.

### Phase 6: Sequential Word Queue, Early Answering, Scrubbing Prevention & Retry Limits (Commit `69b07d1`)
- [x] **Disable YouTube Progress Slider & Scrubbing:**
  - Added `:show-controls="false"` and `:disable-scrubbing="true"` to `YouTubePlayer.vue`.
  - Configured `controls: 0`, `disablekb: 1`, and transparent pointer-events overlay so players cannot cheat or drag the scrubber.
- [x] **Sequential Active Gap Queue & Early Answering:**
  - Created `ActiveGapResolver.ts` (34 lines) to resolve target gap as the first unsolved gap in the verse.
  - Users can type or select choices early before the word timestamp or complete the current verse without waiting.
  - Even if missed, the gap remains active and typeable while the verse is playing.
  - In Choice Mode, choices update immediately upon answering the previous word.
- [x] **Stale Verse Auto-Skip & Consecutive Fail Protection:**
  - Extracted `VerseLoopManager.ts` (34 lines) and updated `AutoPauseController.ts` (131 lines) to track verse retries.
  - Automatically loops up to 2 times (3 total attempts). If still uncompleted, marks unsolved gaps as failed and continues the song with a skip banner.
  - In Strict Mode, 3 consecutive failed attempts on a word auto-reveals it as failed and resumes playback.
- [x] **Pure OOP Gameplay Engine Architecture:**
  - Created `GameplaySessionEngine.ts` (194 lines, max class size 147 lines) to cleanly encapsulate gameplay state, reducing Vue composable complexity from 22 to 2.
  - Added comprehensive unit tests in `packages/core/test/session-engine.test.ts` (48 total passing tests).
  - Verified 0 Biome errors across 100 files and successful full monorepo build.

### Phase 7: Fast-Typing UX, Keystroke Auto-Submit & Configurable Symbol Normalization (Commit `3d0311a`)
- [x] **Real-Time Keystroke Auto-Submit:**
  - Updated `GameplaySessionEngine.ts` to support non-penalizing keystroke validation (`submitAnswer(input, isAutoCheck = true)`).
  - As soon as the user finishes typing the matching letters, the word auto-submits instantly, clears input, and advances to the next gap without requiring the Enter key.
  - Pressing Space or Enter still submits explicitly.
- [x] **Configurable Apostrophe & Symbol Normalization:**
  - Enhanced `AnswerValidator.ts` with `ignoreApostrophes: true` and symbol stripping (`!?,.:;"~_()[]{}`).
  - Typing `dont` matches `don't`, `its` matches `it's`, `im` matches `I'm`, and `rocknroll` matches `rock'n'roll`.
  - Added user preference toggle in `PreGameLobby.vue` and on-the-fly badge in `ScoreBar.vue` (`🔤 Symbols: Auto` vs `🔤 Symbols: Exact`).
- [x] **Verification & Tests:**
  - Added unit tests for apostrophe normalization and real-time auto-submit in `packages/core/test/gameplay.test.ts` and `packages/core/test/session-engine.test.ts` (49 tests passing).
  - 0 Biome errors across 100 files; full production build clean.

### Phase 8: Auto-Submit on Verse Rewind & Hardware Keyboard Chatter Debounce (Commit `18e845a`)
- [x] **Verse Loop Auto-Submit on Rewind:**
  - Added tick-level and rewind-level evaluation for pre-typed answers in `useGameplaySession.ts` and `GameplayContainer.vue`.
  - When the user pre-types the correct word before or during verse rewinds, the answer is auto-submitted automatically without requiring manual Enter keystrokes.
- [x] **Hardware Keyboard Debouncing & Extra Double-Character Filtering:**
  - Created run-length encoding chatter matcher in `AnswerValidator.ts` (`matchesWithChatter`). Correctly forgives hardware chatter (e.g., `llike`, `likke`, `loook` for `like` and `look`) while strictly rejecting wrong characters or missing double characters.
  - Implemented real-time hardware chatter prevention in `WriteInput.vue` (<75ms for same key) and target-word double check on `@keydown` to prevent redundant double letters from entering the input field.
  - Extracted `WordTransitionHelper.ts` to keep `GameplaySessionEngine.ts` strictly within the 200-line hard limit (197 lines) and max 150-line class size.
  - Added configurable user preferences in `PreGameLobby.vue` and `ScoreBar.vue` (`🛡️ Anti-Chatter`).
  - Added comprehensive unit tests in `gameplay.test.ts` and `session-engine.test.ts` (39 core passing tests). All 101 files verified clean by Biome.

---

## Architectural Decisions & Deviations

1. **Bun as Monorepo Package Manager:** Workspaces managed cleanly at root level (`apps/*`, `packages/*`).
2. **Concurrent Dev Runner (`scripts/dev.ts`):** Spawns Elysia API (`port 4000`) and Nuxt 4 (`port 3000`) concurrently with unified stdout/stderr streaming.
3. **Pure OOP in `packages/core`:** Zero framework dependencies. Domain logic encapsulated in `GameplaySessionEngine`, `ActiveGapResolver`, `VerseLoopManager`, `AutoPauseController`, `WordHintHelper`, `GameplayScorer`.
4. **No Godmode Discipline:** Maximum 200 lines per file, 150 lines per class, 35 lines per method, 3 levels of nesting. No dumping grounds like `utils.ts`.
5. **Keystroke-Level Auto-Validation:** Evaluates input on `@input` with `isAutoCheck = true` so valid words submit with zero latency without penalizing typing mid-word.
6. **Apostrophe Invariance:** Normalizes `'`, `’`, `‘`, and backticks identically across user input and lyrics token text.

---

## Known Issues / Blockers

- None. All 49 unit & integration tests passing. Nuxt 4 & Elysia production builds clean. Biome 0 errors across 100 files.

---

## Exact Next Step

1. Commit atomic unit: `feat(gameplay): real-time keystroke auto-submit and configurable apostrophe/symbol normalization`.
2. Launch `bun run dev` (API on port 4000, Web on port 3000).
3. Test in browser:
   - In Write Mode: Type `dont` for `don't` without pressing Enter -> word auto-completes and advances to the next gap the moment the last letter is typed!
   - Toggle Symbols button in ScoreBar -> `🔤 Symbols: Auto` vs `🔤 Symbols: Exact`.


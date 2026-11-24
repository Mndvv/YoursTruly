# PROGRESS.md — Single Source of Truth

## Current State
- **Current Phase:** Phase 14: Non-Repeating Choice Tile Placement & Varied Distractor Sampling
- **Active Task:** [x] Phase 14 complete — Non-repeating choice tile placement (consecutive repeat count = 0), dynamic whole-song distractor sampling, and non-alphanumeric token gap exclusion
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
- [x] Fix Docker SQLite `/data` volume permissions for non-root `bun` user and tune healthcheck parameters
- [x] Expose API port 4000 on host and configure Nuxt Nitro server reverse proxy for seamless mobile/LAN access
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

### Phase 9: Catalogue Export/Import, In-App YouTube Search & Mobile Virtual Keyboard UX (Commit `5ca465b`)
- [x] **Catalogue Export & Import:**
  - Added `exportAll()` and `upsert()` methods in `ISongRepository` and `SqliteSongRepository` (185 lines).
  - Added `exportCatalogue()` and `importCatalogue()` methods in `SongService.ts` with validation using `SongDetailDtoSchema`.
  - Implemented `GET /api/songs/export` and `POST /api/songs/import` in `songs.controller.ts` with comprehensive unit tests in `api.test.ts`.
  - Created Tier 1 presentational `SongCard.vue` (57 lines) and updated `SongCatalogContainer.vue` (173 lines) with Export JSON and Import JSON buttons with user-friendly notice banners.
- [x] **In-App YouTube Search:**
  - Created `YouTubeSearchScraper.ts` (73 lines) to search YouTube videos directly from `ytInitialData` with zero API key requirement, returning video IDs, titles, channel names, duration, and thumbnails.
  - Wired into `IYouTubeGateway.ts`, `YouTubeGateway.ts`, and added `GET /api/youtube/search` in `youtube.controller.ts`.
  - Created `YouTubeVideoSelector.vue` (179 lines) in Studio with tab switcher between "Search YouTube" and "Paste Link / ID", responsive cards, and accessible touch targets.
- [x] **Mobile Responsiveness & Virtual Keyboard Handling:**
  - Added `interactive-widget=resizes-content` and `viewport-fit=cover` in `apps/web/nuxt.config.ts`.
  - Created `useVirtualKeyboard.ts` composable (43 lines) tracking `visualViewport` height changes and exposing `isKeyboardOpen`, `keyboardHeight`, and `dismissKeyboard()`.
  - Updated `GameplayContainer.vue` with dynamic keyboard lift padding and mobile "Hide Keyboard" floating toolbar button.
  - Added `handleFocus` smooth scroll in `WriteInput.vue` to ensure active input is never obscured by virtual keyboards on mobile devices (360px-430px).
  - Adhered strictly to `antislop-ui` design rules: no generic gradients, no glowing orbs, high contrast, clean typography, min 44px touch targets.
  - Verified 0 Biome errors across 105 files and 52 passing monorepo unit tests.

### Phase 10: Anti-Cheat CC Disabling, Lyric Video Blur & Verse Loop Rewind Stabilization (Commit `99afa0f`)
- [x] **YouTube CC / Subtitle Anti-Cheat:**
  - Added `cc_load_policy: 0` and `iv_load_policy: 3` to `playerVars` in `YouTubePlayer.vue`.
  - Added `disableCaptions()` calling `player.unloadModule("captions")`, `player.unloadModule("cc")`, and clearing caption tracks on `onReady` and state changes.
- [x] **Lyric Video Auto-Detection, Schema & Censorship Blur:**
  - Added `isLyricVideo: z.boolean().default(false)` in `packages/contracts/src/lyrics.schema.ts`.
  - Implemented `isLyricVideo(rawTitle: string): boolean` in `YouTubeTitleCleaner.ts` detecting `\b(lyrics?|lyricss?)\b` keywords.
  - Added `isLyricVideo` to `SongLyrics` domain model and serialization.
  - Created Tier 1 presentational `LyricVideoToggle.vue` (39 lines) in Sync Studio with auto-detect badge and manual toggle.
  - Extracted tap sync logic into `useStudioTapSync.ts` (74 lines) to keep `useSyncStudio.ts` (165 lines) and `SyncStudioContainer.vue` (183 lines) clean.
  - Added `isBlurred` prop and ambient background blur styling (`blur-2xl scale-110 filter brightness-75` + censorship indicator) to `YouTubePlayer.vue`.
  - Passed `:is-blurred="Boolean(song.lyricsData?.isLyricVideo)"` from `GameplayContainer.vue` (197 lines) and extracted `GameplayBanner.vue` (35 lines).
- [x] **Verse Loop Rewind Anti-Flash & Anti-Cheat Fix:**
  - Added `pendingRewindLine`, `pendingRewindToMs`, and `rewindExpiryMs` to `VerseLoopManager.ts`.
  - Locked `activeLine` during asynchronous YouTube iframe seeks in `GameplaySessionEngine.ts` (197 lines) until player clock arrives at target rewind timestamp (`timeMs <= targetRewindMs + 400`).
  - Extracted `WordTransitionHelper.ts` (81 lines) to handle gap skipping and failure transitions.
  - Prevented lyrics from flashing forward or unmasking, preserved user typing input during loop transitions, and prevented choice distractor reshuffling.
- [x] **Verification & Tests:**
  - Added unit tests for title detection in `packages/core/test/cleaner.test.ts` and rewind activeLine locking in `packages/core/test/session-engine.test.ts`.
  - All 54 monorepo tests passing across 11 test suites.
  - 0 Biome errors across 109 files. Strict NO GODMODE limits enforced across all files (all <= 200 lines).

### Phase 11: Song Editing in Sync Studio & Shifter Method Bug Fix (Commit `ca02df3`)
- [x] **LyricTimingShifter Bug Fix (`findFirstStartMs` TypeError):**
  - Added `findFirstStartMs()` and `shiftAll()` method aliases in `LyricTimingShifter.ts` (71 lines).
  - Updated `useStudioTapSync.ts` with `?? 0` null-coalescing fallback.
  - Added unit test cases for both method aliases in `packages/core/test/sync.test.ts`.
- [x] **Re-enter Sync Studio for Existing Music (Editing Capability):**
  - Created `useStudioSongPersistence.ts` (146 lines) managing song fetching (`GET /api/songs/:id`), updates (`PUT /api/songs/:id`), and localStorage edit token caching.
  - Updated `useSyncStudio.ts` (163 lines) with `loadSongForEditing()` jumping straight to the sync authoring step.
  - Added `route.query.id` auto-loader in `SyncStudioContainer.vue` (176 lines) with "Editing Song" indicator, "Save Changes 💾" action, and secret edit token entry.
  - Extracted `StudioPublishedCard.vue` (27 lines) and `StudioLivePreview.vue` (50 lines) to maintain strict NO GODMODE limit (< 200 lines).
- [x] **Full Toggle and Timing Editing Support:**
  - Preserved and made fully editable: `LyricVideoToggle` (`isLyricVideo` blur), word-level gap click toggles, track alignment, and global offsets.
  - Added "Edit ✏️" button to `SongCard.vue` (65 lines) in Song Catalog and `PreGameLobby.vue` (198 lines) in Pre-Game.
- [x] **Verification & Tests:**
  - All 54 unit and integration tests passing across 11 test suites.
  - 0 Biome errors across 112 files.
  - Production build (`bun run build`) compiling client and Nitro server cleanly.

---

## Architectural Decisions & Deviations

1. **Bun as Monorepo Package Manager:** Workspaces managed cleanly at root level (`apps/*`, `packages/*`).
2. **Concurrent Dev Runner (`scripts/dev.ts`):** Spawns Elysia API (`port 4000`) and Nuxt 4 (`port 3000`) concurrently with unified stdout/stderr streaming.
3. **Pure OOP in `packages/core`:** Zero framework dependencies. Domain logic encapsulated in `GameplaySessionEngine`, `ActiveGapResolver`, `VerseLoopManager`, `AutoPauseController`, `WordHintHelper`, `GameplayScorer`.
4. **No Godmode Discipline:** Maximum 200 lines per file, 150 lines per class, 35 lines per method, 3 levels of nesting. No dumping grounds like `utils.ts`.
5. **Keystroke-Level Auto-Validation:** Evaluates input on `@input` with `isAutoCheck = true` so valid words submit with zero latency without penalizing typing mid-word.
6. **Apostrophe Invariance:** Normalizes `'`, `’`, `‘`, and backticks identically across user input and lyrics token text.
7. **Rewind ActiveLine Pinning:** Pinning `activeLine` in `VerseLoopManager` during asynchronous seek avoids visual flicker, prevents cheating, and preserves user input.
8. **Decoupled Studio Persistence:** Extracted `useStudioSongPersistence.ts` and `StudioLivePreview.vue` so container and studio composables remain thin, focused, and maintainable.

---

## Known Issues / Blockers

- None. All 54 unit & integration tests passing. Nuxt 4 & Elysia production builds clean. Biome 0 errors across 112 files.

---

## Phase 12: UI Overhaul [COMPLETED] (Commits `291a9eb`, `c611598`)

**Completed:** 2026-11-24

### Completed Checklist
- [x] **Brand Identity & DESIGN.md:** Authored `DESIGN.md` defining the brand character (focused energy, music learning game), violet brand palette (`#7c3aed`), amber game-state accent (`#fbbf24`), typography rules, and antislop compliance.
- [x] **Complete Emoji Removal:** Replaced 30+ emoji instances across all Vue components with professional Phosphor Icons or clean typography. Zero emoji remain in `apps/web/app/`.
- [x] **Phosphor Icons Installed:** Integrated `@phosphor-icons/vue` (non-Lucide, with distinct music & game iconography: PhPlay, PhPencilSimple, PhCrosshair, PhTarget, PhProhibit, PhSun, PhMoon, PhLightning, PhCheckCircle, PhXCircle, PhShieldCheck, PhTextbox, PhPenNib, PhSquaresFour, PhHandPalm, PhArrowsClockwise, PhPause, PhArrowCounterClockwise, PhLightbulb, PhLockSimple, PhEyeSlash, PhGear, PhX, PhKey).
- [x] **Theme System (Light & Dark Mode):** Built `apps/web/app/assets/css/theme.css` with CSS custom properties and full light mode adaptation, plus `useTheme.ts` composable with system preference detection and localStorage persistence.
- [x] **Header Theme Toggle:** Added accessible sun/moon toggle button in `AppHeader.vue`.
- [x] **Accessibility & Antislop Compliance:**
  - Removed `user-scalable=no, maximum-scale=1` from viewport meta in `nuxt.config.ts` (R-39 compliance).
  - Ensured minimum 44px touch targets on mobile interactive controls (R-03 compliance).
  - Replaced endless pulse animation on non-live paused banner with static styling (R-19 compliance).
  - Added skeleton loaders for catalog loading state (R-27 compliance).
  - Enforced `cursor: pointer` on interactive elements and `cursor: not-allowed` on disabled elements (R-39).
- [x] **Gameplay Viewport & Zero-CLS Optimizations:**
  - Removed large centered "Lyric Video Blurred" text overlay and replaced with a discreet corner badge (`PhLockSimple` + "Blurred" in top-right corner).
  - Scaled and constrained YouTube embed (`max-w-[380px] sm:max-w-[440px] aspect-video`) in standard document flow without sticky stacking conflicts, guaranteeing ScoreBar and all gameplay controls sit cleanly below the video with zero overlap.
  - Fixed Cumulative Layout Shift (CLS = 0) in `GameplayBanner.vue` by giving it a permanent fixed-height container (`h-9 sm:h-10`) so that verse rewind/skip notices and pause states never shift the lyrics or choice buttons downward, eliminating fast-track misclicks.
- [x] **No Godmode Policy Adherence:** Extracted `PauseModeSelector.vue` from `PreGameLobby.vue` and `MobileKeyboardToolbar.vue` from `GameplayContainer.vue` so that every file in `apps/web/app` remains strictly under the 200-line hard limit.
- [x] **Verification & Builds:**
  - 54 Bun unit & integration tests passing.
  - 0 Biome errors across 116 files.
  - Nuxt 4 production build completed cleanly.
  - Docker containers (`yourstruly-web-1` and `yourstruly-api-1`) rebuilt and verified live.

---

## Known Issues / Blockers

- None. All 54 unit & integration tests passing. Nuxt 4 & Elysia production builds clean. Biome 0 errors across 116 files.

---

## Phase 13: Non-Latin Unicode Support & Choice Distractor Randomization [COMPLETED]

**Completed:** 2026-11-24

### Completed Checklist
- [x] **Choice Option Randomization:** Replaced deterministic `localeCompare` sorting in `ChoiceDistractorGenerator` with a true Fisher-Yates shuffle algorithm. Correct answers now randomly distribute evenly across Tiles A, B, C, and D instead of clustering on the same tile repeatedly.
- [x] **Non-Latin Candidate Extraction:** Replaced ASCII-only regex `/[^a-z0-9]/gi` with Unicode property escapes `replace(/[\p{P}\p{S}\s]+/gu, "")` and length checks (`Array.from(clean).length >= 1`). Single-kanji and non-Latin words (Japanese, Chinese, Korean, Cyrillic, Arabic) are now properly extracted as candidate distractors from the song's lyrics.
- [x] **Universal Unicode Normalization in AnswerValidator:** Added `NFKC` normalization to standardize full-width Latin/numbers (e.g. `ｔｅｓｔ` to `test`) and half-width katakana. Handled punctuation and symbols with Unicode `\p{L}\p{N}\s` while properly respecting `ignoreApostrophes: false`.
- [x] **Unicode Blank Formatting in LyricDisplay:** Updated `formatBlank` in `LyricDisplay.vue` to use Unicode property stripping and `Array.from` grapheme counting (`Math.max(2, Math.min(6, chars.length))`), accurately sizing blanks for Japanese and non-Latin scripts.
- [x] **Non-Latin WordHintHelper:** Handled Unicode code points in `WordHintHelper.ts` (`getLetterHint`, `isFullyRevealed`), progressively revealing Japanese characters (e.g. `さくら` -> `さ _ _` -> `さ く _`) and randomizing 50/50 choice hint order.
- [x] **IME Composition in WriteInput:** Added `isComposing` state with `@compositionstart` and `@compositionend` handlers, plus a guard in `handleKeyDown` ensuring Enter and Space are not intercepted while composing in IME, allowing Japanese/CJK users to convert kana to kanji and select candidates without triggering premature submission.
- [x] **Test Coverage:** Added `packages/core/test/unicode-gameplay.test.ts` covering Japanese/CJK validation, full-width NFKC normalization, progressive hints, candidate distractor extraction, and 50-iteration Fisher-Yates shuffle distribution. All 59 unit & integration tests passing.
- [x] **Production Verification:** Clean Biome lint across 117 files, Nuxt 4 production build completed, Docker containers rebuilt and healthy.

---

## Phase 14: Non-Repeating Choice Tile Placement & Dynamic Distractor Sampling [COMPLETED]

**Completed:** 2026-11-24

### Completed Checklist
- [x] **Zero Consecutive Tile Repeats:** Added `avoidIndex?: number` parameter to `ChoiceDistractorGenerator.generateChoices` and state tracking in `WordTransitionHelper` (`lastCorrectTileIndex`). Correct answer position is strictly excluded from landing on the same tile as the previous word (`consecutiveRepeats = 0`), eliminating repetitive muscle memory or perceived clustering.
- [x] **Dynamic Distractor Pool Sampling:** Replaced static `uniqueCandidates.slice(0, 3)` (which previously locked the distractors to the first 3 words of the song) with dynamic random sampling from the candidate pool across the entire song. Every word now receives 3 fresh, unique distractors.
- [x] **Non-Alphanumeric Gap Exclusion:** Updated `GapGenerator.generateGaps` to require `[\p{L}\p{N}]`, preventing musical symbols (`♫♫♫`, `♪♪♪`) and instrumental markers from becoming unsolvable gaps.
- [x] **AnswerValidator Fallback:** Added clean target length fallback check so non-alphanumeric tokens never cause perpetual hang if present.
- [x] **Cognitive Complexity & No Godmode Compliance:** Extracted `collectCandidates`, `sampleDistractors`, `pickTargetSlot`, and `buildOptions` helper methods in `ChoiceDistractorGenerator.ts` to keep complexity $\le 15$ and all files strictly $\le 200$ lines.
- [x] **Test & Build Verification:** 60 Bun unit tests passing, 0 Biome lint errors across 117 files, Nuxt 4 build clean, Docker web & api containers rebuilt and healthy.

---

## Exact Next Step

1. Await next user instruction or feature request.


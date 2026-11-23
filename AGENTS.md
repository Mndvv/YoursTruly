# AGENTS.md — AI Agent Operating Guidelines

This document governs the engineering standards, code hygiene, and continuity protocol for all AI coding agents working on **OSS LingoClip (YoursTruly)**.

---

## 1. Core Operating Principles

1. **Check Local Lyrica Documentation First:** Before writing or changing any Lyrica API call or normalizer, read `lyrica-docs/`. Never hallucinate query parameters or payload schemas.
2. **Single Source of Truth for Progress:** Maintain `PROGRESS.md` after every atomic task or milestone.
3. **Commit Every Atomic Unit:** Commit immediately after running tests/typechecks. Never leave uncommitted dirty work.
4. **No Slop:** Write clean, intentional, self-documenting code. Avoid generic filler comments that merely repeat what the code does.

---

## 2. Strict "NO GODMODE" Policy

Files, classes, functions, or components that bundle multiple responsibilities are strictly forbidden.

| Target | Hard Limit | Enforcement Action |
| :--- | :--- | :--- |
| **File Length** (`.ts`, `.vue`) | **Max 200 lines** | Split into sub-modules, sub-components, or dedicated domain classes. |
| **Class Size** | **Max 150 lines**, max **7 public methods** | Extract collaborators; use Strategy, State, or Command patterns. |
| **Function / Method Length** | **Max 35 lines** | Extract descriptive private helper methods. |
| **Parameter Count** | **Max 4 parameters** | Group into a typed configuration or parameter object. |
| **Nesting Depth** (`if`, `for`) | **Max 3 levels** | Flatten with guard clauses and early returns. |
| **Dumping-Ground Files** | **STRICTLY FORBIDDEN** | Files like `utils.ts`, `helpers.ts`, `common.ts`, or `GameManager.ts` are prohibited. Name files by specific domain role (e.g., `TextNormalizer.ts`, `TimestampCalculator.ts`). |

---

## 3. Architecture & Coding Standards

### 3.1. Core Domain (`packages/core`)
- **Pure Object-Oriented Programming (OOP):** Zero dependencies on Nuxt, Vue, or Elysia.
- **Single Responsibility Engines:**
  - `SyncClockEngine`: Active line/word resolution.
  - `GapGenerator`: Gap selection based on difficulty.
  - `AnswerValidator`: Input normalization and tolerance matching.
  - `AutoPauseController`: Auto-pause triggers on unsolved gap boundaries.
  - `TapSyncRecorder`: Spacebar/pad timing recording.
- **Strategy Pattern for Lyrica Normalization:**
  - `WordSyncedLyricaStrategy`, `LineSyncedLyricaStrategy`, `PlainTextLyricaStrategy`.
- **Dependency Inversion Principle (DIP):** Depend on interfaces (`ISongRepository`, `ILyricaGateway`), never concrete implementations.
- **Value Objects & Encapsulation:** Encapsulate time, lines, and tokens. Expose semantic domain mutation methods instead of arbitrary field mutation.

### 3.2. Backend API (`apps/api`)
- **ElysiaJS on Bun:**
  - Controllers must be thin HTTP route mappers (max 100 lines).
  - Business logic delegated to Services.
  - All Lyrica calls proxied through `LyricaGateway`.
  - Anti-abuse: Rate limiting and configurable Cloudflare Turnstile verification.

### 3.3. Frontend UI (`apps/web`)
- **Nuxt 4 + Vue 3 + Tailwind CSS:**
  - **Tier 1 (UI):** Dumb presentational components (`components/ui/`, `components/player/`, `components/game/`, `components/studio/`). Props & emits only; no `$fetch`, no `localStorage`.
  - **Tier 2 (Containers):** Smart containers in `features/` wiring composables to presentation.
  - **Tier 3 (Pages):** Ultra-thin pages (max 60 lines) handling routes and SEO tags.
- **Thin `<script setup>`:** Max 80 lines. Extract complex state into dedicated composables wrapping `packages/core` instances.
- **Mobile-First UX:** Always ensure sticky video and virtual-keyboard-safe layouts on `360px–430px` screens.

---

## 4. Git & Handoff Continuity Discipline

- **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- **Handoff Checklist in `PROGRESS.md`:**
  - Current Phase & Active Task
  - Completed Checklist with verification notes
  - Architectural Decisions / Deviations
  - Known Issues / Blockers
  - Exact Next Step for the next agent session

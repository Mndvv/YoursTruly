# YoursTruly (OSS LingoClip)

> Open-source, self-hostable language learning platform using YouTube music videos with word-level lyric synchronization, assisted lyric fetching via Lyrica, and interactive gameplay.

---

## Features

- **YouTube IFrame Player Integration:** No media hosting; directly stream YouTube music videos.
- **Assisted Lyrica Lyrics Integration:** Search and fetch word-level, line-level, and plain-text lyrics from a self-hosted [Lyrica](https://lyrica.collei.my.id/) instance.
- **Authoring & Sync Studio:** Tap-to-sync word timing, trim video boundaries, adjust global offset, and review transliterations.
- **LingoClip Gameplay:**
  - **Write Mode & Choice Mode**
  - **Difficulty Levels:** Beginner (10%), Intermediate (25%), Advanced (50%), Expert (100%)
  - **Auto-Pause:** Pauses automatically at gaps, with keyboard replay shortcut (`Tab` / `Backspace`).
- **No-Auth Model with Secret Edit Tokens:** Upload immediately; edit anytime with a private token.
- **Self-Hostable:** Single-command deployment using Docker Compose with SQLite by default or optional PostgreSQL.

---

## Monorepo Layout

```text
.
├── apps/
│   ├── api/          # ElysiaJS REST API (Bun runtime)
│   └── web/          # Nuxt 4 + Vue 3 + Tailwind CSS frontend
├── packages/
│   ├── contracts/    # Shared DTOs and Lyric JSON Schema v1
│   ├── core/         # Pure OOP domain logic (sync engine, gap generator, validator)
│   └── db/           # Drizzle ORM schema, migrations, and repositories
├── docker-compose.yml# Production self-hosting configuration
└── PLANNING.md       # Architectural blueprint & engineering guidelines
```

---

## Getting Started (Local Development)

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+)
- Docker (optional, for containerized deployment)

### Setup

```bash
# Clone the repository
git clone <repo-url> yourstruly
cd yourstruly

# Install monorepo dependencies
bun install

# Copy environment template
cp .env.example .env

# Run database migrations
bun run db:migrate

# Start development servers
bun run dev
```

The web application runs at `http://localhost:3000` and the API runs at `http://localhost:4000`.

---

## Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `4000` | Port for the Elysia API server |
| `DB_DRIVER` | `sqlite` | Database driver (`sqlite` or `postgres`) |
| `DATABASE_URL` | `file:./data/yourstruly.db` | SQLite file path or Postgres connection string |
| `LYRICA_BASE_URL` | `https://lyrica.collei.my.id` | Base URL of the Lyrica lyrics backend |
| `TURNSTILE_ENABLED` | `false` | Enable Cloudflare Turnstile anti-bot verification |
| `TURNSTILE_SECRET_KEY` | `""` | Turnstile secret key for API validation |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:4000` | Public API URL accessed by browser client |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | `""` | Turnstile public site key for frontend widget |

---

## Docker Self-Hosting

Run with SQLite (default, zero extra configuration required):

```bash
docker compose up -d
```

Run with PostgreSQL:

```bash
docker compose --profile postgres up -d
```

---

## License

MIT

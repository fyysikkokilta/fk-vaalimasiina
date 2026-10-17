# Development Guide

## Prerequisites

- **Node.js** 26 or later
- **pnpm** 11 or later (`npm install -g pnpm` or via [corepack](https://nodejs.org/api/corepack.html))
- **PostgreSQL** 14 or later (local install, Docker, or a managed service)

## Setup

```bash
# Clone the repository
git clone https://github.com/fyysikkokilta/fk-vaalimasiina.git
cd fk-vaalimasiina

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env — required: DATABASE_URL, AUTH_SECRET, ADMIN_EMAILS, OAUTH_PROVIDERS + credentials
# For local dev you can leave SMTP settings empty (emails are only logged, not sent)

# Run database migrations
pnpm db:migrate

# Start the development server
pnpm dev
```

The app runs at `http://localhost:3000`. Navigate to `/en/` or `/fi/` for the app.

## Development Shortcuts

In development and test environments:

- **`test@email.com`** is automatically authorized as an admin — no OAuth setup needed to access the admin panel locally
- Email sending is skipped — voting links are printed to the terminal console instead

## Available Scripts

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `pnpm dev`               | Start development server with hot reload |
| `pnpm build`             | Create production build                  |
| `pnpm start`             | Start production server (after build)    |
| `pnpm lint`              | Lint with oxlint                         |
| `pnpm lint --fix`        | Lint and auto-fix                        |
| `pnpm format`            | Format code with oxfmt                   |
| `pnpm format:check`      | Check formatting without fixing          |
| `pnpm typecheck`         | TypeScript type check (`tsgo --noEmit`)  |
| `pnpm db:migrate`        | Run pending database migrations          |
| `pnpm db:generate`       | Generate migration from schema changes   |
| `pnpm generate-election` | Generate test election data              |
| `pnpm test`              | Run all Playwright tests (see Testing)   |
| `pnpm test:db`           | Start throwaway test Postgres (Docker)   |

## Testing

Tests use Playwright. They need Docker (for a throwaway Postgres) and nothing else: no `.env` setup.

```bash
pnpm test:db                  # start the test database on port 55432
pnpm test                     # run every test in every browser
pnpm test:db:stop             # stop and delete the test database
```

Useful variants:

```bash
pnpm test tests/voter-voting.spec.ts   # one file
pnpm test --project=chromium           # one browser
pnpm test:algorithm                    # STV and majority algorithm tests only: no dev server, no database
npx playwright show-report             # open the report of the last run
```

How it works:

- **Env:** `playwright.config.ts` sets every required variable to a test default. It deliberately does not read `.env`, because the tests clear every table and must never hit your dev database. S3 and OAuth variables are set empty so `next dev` does not pick them up from `.env` either. Variables already set in your shell win (CI only sets `DATABASE_URL` and `NEXT_PUBLIC_BASE_URL`).
- **Database:** a global setup runs the migrations against the test database before the tests start.
- **Dev server:** Playwright starts its own `pnpm dev`. Stop your own dev server first: it uses your `.env`, so Playwright refuses to reuse it and fails with "port 3000 is already used".

## Database

### Schema

The schema is defined in `src/db/schema.ts` using Drizzle ORM. Key tables:

| Table        | Purpose                                                     |
| ------------ | ----------------------------------------------------------- |
| `elections`  | Election metadata, status, voting method                    |
| `candidates` | Candidates for each election                                |
| `voters`     | Registered voter emails                                     |
| `has_voted`  | Tracks who has voted (for secrecy, linked only to voter ID) |
| `ballots`    | Anonymous ballots (no link to voter after voting)           |
| `votes`      | Individual ranked votes linked to ballots                   |

### Making Schema Changes

1. Edit `src/db/schema.ts`
2. Generate a migration: `pnpm db:generate`
3. Review the generated SQL in `src/drizzle/`
4. Apply: `pnpm db:migrate`
5. Commit both the schema change and migration file

## Code Conventions

- **Package manager:** pnpm (enforced via preinstall hook)
- **Imports:** Use `~/` path alias for `src/` (e.g., `import { env } from '~/env'`)
- **Navigation:** Import `Link`, `redirect`, `useRouter`, `usePathname` from `~/i18n/navigation`, NOT from `next/link`/`next/navigation`
- **Translations:** All user-facing text must go through the i18n translation system — no hardcoded strings in JSX
- **Commit format:** [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, etc.

### Pre-commit Hook

A lint-staged hook runs on every commit:

1. `tsgo --noEmit` — TypeScript type check
2. `oxlint --fix` — Linting with auto-fix
3. `oxfmt` — Code formatting

If a commit fails due to the hook, fix the reported issues and commit again (don't use `--no-verify`).

## Project Structure

```
src/
├── actions/          # Server actions (mutations) — next-safe-action + Zod
│   ├── admin/        # Admin-only actions (election CRUD, voter management)
│   ├── middleware/   # isAuthorized middleware
│   └── vote.ts       # Voter ballot submission
├── algorithm/        # Voting algorithms
│   ├── stvAlgorithm.ts      # STV with Droop quota
│   ├── majorityAlgorithm.ts # Plain majority
│   └── shuffleWithSeed.ts   # Deterministic tiebreaking
├── app/[locale]/     # Next.js App Router pages (en + fi)
│   ├── admin/        # Admin pages (election management)
│   ├── vote/         # Voter-facing voting page
│   └── results/      # Public results page
├── auth/             # OAuth provider configuration
├── components/       # React components
├── data/             # Data fetching (server-side)
├── db/               # Drizzle ORM schema, relations, migrate script
├── emails/           # Email templates (react-email) and sending handler
├── i18n/             # Translations (en.ts, fi.ts) and routing config
├── settings/         # Election step state machine configuration
└── env.ts            # Environment variable validation (@t3-oss/env-nextjs)
```

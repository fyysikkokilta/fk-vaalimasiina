# Development Guide

## Prerequisites

- **Node.js** 24 or later
- **pnpm** 10 or later (`npm install -g pnpm` or via [corepack](https://nodejs.org/api/corepack.html))
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

| Command                      | Description                              |
| ---------------------------- | ---------------------------------------- |
| `pnpm dev`                   | Start development server with hot reload |
| `pnpm build`                 | Create production build                  |
| `pnpm start`                 | Start production server (after build)    |
| `pnpm lint`                  | Lint with oxlint                         |
| `pnpm lint --fix`            | Lint and auto-fix                        |
| `pnpm format`                | Format code with oxfmt                   |
| `pnpm format:check`          | Check formatting without fixing          |
| `pnpm type:check`            | TypeScript type check (`tsc --noEmit`)   |
| `pnpm db:migrate`            | Run pending database migrations          |
| `pnpm db:generate-migration` | Generate migration from schema changes   |
| `pnpm generate-election`     | Generate test election data              |

## Testing

### Algorithm Tests (fast, no browser)

```bash
npx playwright test tests/algorithm/
```

Tests the STV and Majority voting algorithms with known inputs and expected outputs. No browser or server needed.

### End-to-End Tests

```bash
npx playwright test
```

Requires a running dev server (auto-started if not running). Uses Chromium. Tests cover the full voting flow: admin login, election setup, voter voting, results display.

To run a single test file:

```bash
npx playwright test tests/voter-voting.spec.ts
```

To see test report:

```bash
npx playwright show-report
```

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
2. Generate a migration: `pnpm db:generate-migration`
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

1. `tsc --noEmit` — TypeScript type check
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

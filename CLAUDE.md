# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FK Vaalimasiina is an electronic voting system for the Guild of Physics, built with Next.js 16, React 19, TypeScript, and PostgreSQL. It implements Single Transferable Vote (STV) with Droop quota for ranked-choice elections.

## Commands

| Task               | Command                                          |
| ------------------ | ------------------------------------------------ |
| Dev server         | `pnpm dev`                                       |
| Build              | `pnpm build`                                     |
| Lint               | `pnpm lint`                                      |
| Lint + autofix     | `pnpm lint --fix`                                |
| Type check         | `pnpm type:check`                                |
| Algorithm tests    | `npx playwright test tests/algorithm/`           |
| E2E tests          | `npx playwright test`                            |
| Single E2E test    | `npx playwright test tests/voter-voting.spec.ts` |
| Format             | `pnpm format`                                    |
| DB migrations      | `pnpm db:migrate`                                |
| Generate migration | `pnpm db:generate-migration`                     |
| Generate test data | `pnpm generate-election`                         |

Package manager is **pnpm** (enforced via `preinstall` hook).

## Architecture

### Routing & i18n

All pages live under `src/app/[locale]/` with `en` and `fi` locales (next-intl). **Do not** import `Link`, `redirect`, `useRouter`, or `usePathname` from `next/link` or `next/navigation` — use `~/i18n/navigation` instead. This is enforced by oxlint `no-restricted-imports`.

All user-facing text must use translations from `src/i18n/en.ts` and `src/i18n/fi.ts`. Avoid hardcoded strings in JSX; use translations.

### Server Actions

Mutations use `next-safe-action` with Zod input schemas. Pattern:

```ts
actionClient
  .inputSchema(zodSchema)
  .use(isAuthorizedMiddleware)  // for admin actions
  .action(async ({ parsedInput }) => { ... })
```

Admin actions are in `src/actions/admin/`, voting action in `src/actions/vote.ts`.

### Database

Drizzle ORM with PostgreSQL. Schema in `src/db/schema.ts`, relations in `src/db/relations.ts`. Uses snake_case column convention. Path alias: `~/db`.

Key tables: `elections` (with status enum: CREATED → UPDATING → ONGOING → FINISHED → CLOSED), `candidates`, `voters`, `ballots`, `votes`, `has_voted`. Voter identity is separated from ballot data for vote secrecy.

### Authentication

OAuth 2.0 flow (Google/GitHub/Microsoft/Custom) → JWT stored in HTTP-only cookie (`admin-token`). Admin access controlled by `ADMIN_EMAILS` env var. Auth middleware in `src/actions/middleware/isAuthorized.ts` and route protection in `src/proxy.ts`.

### Environment

Validated with `@t3-oss/env-nextjs` in `src/env.ts`. Import as `import { env } from '~/env'`. Skip validation with `SKIP_ENV_VALIDATION=true`.

### Path Alias

`~/*` maps to `./src/*` (configured in tsconfig.json).

## Coding Conventions

- **Commits**: Conventional Commits format — `feat:`, `fix:`, `refactor:`, `chore:`, etc. Imperative mood, lowercase, no period. One logical change per commit.
- **Linting**: Always run `pnpm lint` after code changes and fix errors before finishing.
- **Imports**: Optionally sorted by oxfmt `experimentalSortImports` when enabled.
- **Styling**: Tailwind CSS 4 with oxfmt (experimentalTailwindcss) for class sorting. Single quotes, no trailing commas.
- **Pre-commit hook**: lint-staged runs `tsc --noEmit`, `oxlint --fix`, and `oxfmt` on staged files.

## Testing

- **Algorithm tests** (Playwright): `tests/algorithm/*.spec.ts` — STV and majority algorithm logic (no browser needed; run with `npx playwright test tests/algorithm/`).
- **E2E tests** (Playwright): `tests/*.spec.ts`. Runs against `http://localhost:3000/en/`. Workers: 1, not parallel. Dev server starts automatically if not running.
- In test/dev mode, `test@email.com` is auto-authorized as admin.

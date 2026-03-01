# Deployment Guide

## Recommended: Docker Compose

### Prerequisites

- Docker and Docker Compose installed on the server
- PostgreSQL database (can be a managed service like Railway, Supabase, or a self-hosted instance)

### Setup

1. **Copy the environment file and configure it:**

   ```bash
   cp .env.example .env
   ```

   Required variables to set before starting:
   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — Random secret string (generate with `openssl rand -base64 32`)
   - `ADMIN_EMAILS` — Comma-separated admin email addresses
   - `OAUTH_PROVIDERS` — Which OAuth provider(s) to enable (e.g., `google`)
   - `OAUTH_<PROVIDER>_CLIENT_ID` and `OAUTH_<PROVIDER>_CLIENT_SECRET` — Provider credentials
   - `NEXT_PUBLIC_BASE_URL` — Your public URL (e.g., `https://vaalit.example.com`)
   - `MAIL_FROM`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` — Email sending

   > ⚠️ `NEXT_PUBLIC_*` variables are baked into the Docker image at build time. If you build your own image, pass them as `--build-arg`. If you use the pre-built image, these defaults (`vaalit.fyysikkokilta.fi`) are already set and you cannot override them at runtime.

2. **Run database migrations:**

   ```bash
   # If running against a local/accessible database directly
   DATABASE_URL="postgresql://..." pnpm db:migrate

   # Or run migrations from inside the container (first start without CMD override):
   docker run --env-file .env ghcr.io/fyysikkokilta/fk-vaalimasiina:latest node src/db/migrate.js
   ```

3. **Start the application:**

   ```bash
   docker compose up -d
   ```

   The app listens on `127.0.0.1:8010` by default. Put it behind a reverse proxy (nginx, Caddy, Traefik) to expose it.

### Nginx Reverse Proxy Example

```nginx
server {
    listen 80;
    server_name vaalit.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name vaalit.example.com;

    ssl_certificate /etc/letsencrypt/live/vaalit.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vaalit.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Updating

The included `update-deployment.sh` script handles updates in three steps:

```bash
./update-deployment.sh
```

This runs:

1. `git pull` — Updates repository files (for docker-compose.yml changes)
2. `docker compose pull` — Pulls the latest Docker image from the registry
3. `docker compose up -d` — Restarts the container with the new image

If you're not tracking the git repository on the server, run:

```bash
docker compose pull && docker compose up -d
```

---

## Building Your Own Image

If you've forked the project and want to customize branding, build your own image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_BASE_URL="https://vaalit.myorg.example.com" \
  --build-arg NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT="My Guild Votes" \
  --build-arg NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT="Votes" \
  --build-arg NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT="myorg.example.com" \
  --build-arg NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK="https://myorg.example.com" \
  -t my-registry/my-vaalimasiina:latest \
  .
```

Push it to your registry and update `docker-compose.yml` to use your image:

```yaml
services:
  app:
    image: my-registry/my-vaalimasiina:latest
```

---

## CI/CD with GitHub Actions

The included `.github/workflows/ci.yml` runs three jobs on every push:

1. **lint** — Type checking, oxlint, oxfmt
2. **test** — Playwright E2E tests against a temporary PostgreSQL database
3. **build** — Builds and pushes a Docker image to GitHub Container Registry (GHCR), only on `master` branch

### Setting Up for Your Fork

1. In your fork's **Settings → Secrets and variables → Actions**, you don't need to add secrets for the container registry — GitHub Actions has built-in access to GHCR for the repository owner.

2. Update the branding env vars in `.github/workflows/ci.yml` (search for `NEXT_PUBLIC_BRANDING_*`) to match your organization.

3. Update `NEXT_PUBLIC_BASE_URL` in the workflow to your production URL.

4. The built image will be pushed to `ghcr.io/<your-github-username>/fk-vaalimasiina`.

---

## Database Management

### Running Migrations

```bash
pnpm db:migrate
```

Requires `DATABASE_URL` to be set.

### Creating a New Migration

After editing `src/db/schema.ts`, generate a migration:

```bash
pnpm db:generate-migration
```

This creates a new SQL file in `src/drizzle/`. Commit it and run `pnpm db:migrate` to apply.

### Other Drizzle Commands

```bash
pnpx drizzle-kit studio  # Open Drizzle Studio (database browser)
pnpx drizzle-kit push    # Push schema directly (dev only, skips migration files)
```

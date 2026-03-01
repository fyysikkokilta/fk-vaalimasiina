# Customization Guide

This guide covers all the ways you can adapt FK Vaalimasiina to your organization without writing much code.

## Branding via Environment Variables

These variables can be set in your `.env` file or passed as Docker build args / runtime env vars.

### Header and Footer (client-side)

These are baked into the build (Next.js limitation — `NEXT_PUBLIC_` vars must be available at build time).

| Variable                                       | Default                    | Description                  |
| ---------------------------------------------- | -------------------------- | ---------------------------- |
| `NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT`       | `Vaalimasiina`             | Full title in the header     |
| `NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT` | `Vaalimasiina`             | Short title (used on mobile) |
| `NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT`        | `fyysikkokilta.fi`         | Footer link label            |
| `NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK`        | `https://fyysikkokilta.fi` | Footer link URL              |

When using Docker, pass these as build arguments:

```bash
docker build \
  --build-arg NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT="My Org Votes" \
  --build-arg NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT="Votes" \
  --build-arg NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT="myorg.fi" \
  --build-arg NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK="https://myorg.fi" \
  .
```

### Email Branding (server-side)

These can be set at runtime (no rebuild needed).

| Variable                        | Default                    | Description                              |
| ------------------------------- | -------------------------- | ---------------------------------------- |
| `BRANDING_EMAIL_SUBJECT_PREFIX` | `Vaalimasiina`             | Email subject prefix and email heading   |
| `BRANDING_MAIL_FOOTER_TEXT`     | `Rakkaudella Fysistit`     | Text shown in email footer               |
| `BRANDING_MAIL_FOOTER_LINK`     | `https://fyysikkokilta.fi` | URL shown in email footer                |
| `BRANDING_PRIMARY_COLOR`        | `#fbdb1d`                  | Voting button background color in emails |
| `BRANDING_SECONDARY_COLOR`      | `#201e1e`                  | Email header background and text color   |

Example for a blue-themed organization:

```env
BRANDING_EMAIL_SUBJECT_PREFIX="My Guild Voting"
BRANDING_MAIL_FOOTER_TEXT="With love, My Guild"
BRANDING_MAIL_FOOTER_LINK="https://myguild.example.com"
BRANDING_PRIMARY_COLOR="#0066cc"
BRANDING_SECONDARY_COLOR="#003366"
```

## Visual Theming (requires code edit)

The web app uses Tailwind CSS 4 with custom CSS properties defined in `src/app/globals.css`:

```css
@theme {
  --color-fk-yellow: #fbdb1d; /* Primary accent (buttons, highlights) */
  --color-fk-black: #201e1e; /* Dark color (header, footer background) */
  --font-roboto: 'Roboto', sans-serif;
}
```

To change the color scheme:

1. Open `src/app/globals.css`
2. Change `--color-fk-yellow` to your primary/accent color
3. Change `--color-fk-black` to your dark color
4. Rebuild the application

To change the font, replace the `Roboto` Google Fonts import in `src/app/[locale]/layout.tsx` and update `--font-roboto` accordingly.

## Logo and Background Pattern

The background pattern visible behind content boxes is the FK logo tile defined in:

- **File:** `public/fii_2.svg`
- **CSS class:** `.fii-background` in `src/app/globals.css`

To replace it:

1. Create your organization's logo/pattern as an SVG
2. Replace `public/fii_2.svg` with your file (keep the same filename, or update the `background-image` URL in `globals.css`)
3. Adjust `background-repeat` or `background-size` in `.fii-background` if needed

## Translations

All user-facing text is in the i18n translation files:

| File             | Locale  |
| ---------------- | ------- |
| `src/i18n/en.ts` | English |
| `src/i18n/fi.ts` | Finnish |

To change any UI text (button labels, instructions, error messages), edit the corresponding string in these files.

### Adding a New Language

1. Copy `src/i18n/en.ts` to `src/i18n/xx.ts` (where `xx` is your locale code, e.g., `sv` for Swedish)
2. Translate all strings in the new file
3. Add the locale to `src/i18n/routing.ts`:
   ```ts
   export const routing = defineRouting({
     locales: ['en', 'fi', 'sv'], // add your locale
     defaultLocale: 'en'
   })
   ```
4. Import and register the new messages in `src/i18n/request.ts`

## Email Template Organization Text

The voting invitation email (`src/emails/Email.tsx`) contains bilingual Finnish/English text referencing the Guild of Physics. If your organization uses different languages or text, edit the phrases directly in that file.

The email heading, button colors, and footer are all configurable via environment variables (see [Email Branding](#email-branding-server-side) above).

## Admin Access

Admin access is controlled by the `ADMIN_EMAILS` environment variable — a comma-separated list of email addresses:

```env
ADMIN_EMAILS="chair@myorg.example.com,secretary@myorg.example.com"
```

Any user authenticated via OAuth whose email is in this list gets full admin access.

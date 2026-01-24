import { redirect } from '~/i18n/navigation'
import { routing } from '~/i18n/routing'

// Handle not found pages by redirecting to the default locale
export default function GlobalNotFound() {
  redirect({
    href: '/',
    locale: routing.defaultLocale
  })
}

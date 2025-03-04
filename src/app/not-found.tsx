import { redirect } from '~/i18n/navigation'
import { routing } from '~/i18n/routing'

// If the provided locale is not found, redirect to the default locale
export default function NotFound() {
  redirect({
    href: '/',
    locale: routing.defaultLocale
  })
}

import '../globals.css'

import { Roboto } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Flip, ToastContainer } from 'react-toastify'

import Footer from '~/components/Footer'
import Header from '~/components/Header'
import { env } from '~/env'
import { routing } from '~/i18n/routing'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'metadata'
  })
  return {
    title: {
      template: `%s | ${t('title')}`,
      default: t('title')
    },
    description: t('description'),
    metadataBase: new URL(env.BASE_URL),
    generator: 'Next.js',
    applicationName: t('title'),
    creator: 'Fyysikkokilta ry'
  }
}

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }))
}

const roboto = Roboto({
  weight: ['400', '700'],
  display: 'swap',
  subsets: ['latin-ext', 'latin'],
  preload: true,
  variable: '--font-roboto'
})

export default async function RootLayout({
  children,
  params
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <html lang={locale} className={`${roboto.variable} ${roboto.className}`}>
      {/*<Script src="https://unpkg.com/react-scan/dist/auto.global.js" />*/}
      <body className="bg-fk-yellow text-fk-black flex h-dvh flex-col">
        <NextIntlClientProvider>
          <Header />
          <main className="m-5 flex flex-1 flex-shrink-0 flex-col items-center">
            <div className="fii-background flex max-w-5xl justify-center rounded-lg bg-white py-4 shadow-md">
              {children}
            </div>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            transition={Flip}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

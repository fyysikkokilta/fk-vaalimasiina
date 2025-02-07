import '../globals.css'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Flip, ToastContainer } from 'react-toastify'

import Footer from '~/components/Footer'
import Header from '~/components/Header'
import { Locale, routing } from '~/i18n/routing'
import { TRPCProvider } from '~/trpc/client'

export const metadata: Metadata = {
  title: 'Vaalimasiina',
  description: 'Fyysikkokillan sähköinen äänestysjärjestelmä'
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale}>
      {/*<script
        async
        src="https://unpkg.com/react-scan/dist/auto.global.js"
      ></script>*/}
      <body className="bg-fk-yellow font-body text-fk-black flex h-dvh flex-col">
        <NextIntlClientProvider messages={messages}>
          <TRPCProvider>
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
          </TRPCProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

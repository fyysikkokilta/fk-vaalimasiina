import { env } from '~/env'

export default function Footer() {
  const APP_HOME_LINK = env.NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK
  const APP_HOME_TEXT = env.NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT
  return (
    <footer className="bg-gray-900 py-8 text-white">
      <div className="container mx-auto px-4 text-center">
        <p>
          {new Date().getFullYear()}{' '}
          <a
            href={APP_HOME_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300"
          >
            {APP_HOME_TEXT}
          </a>
        </p>
      </div>
    </footer>
  )
}

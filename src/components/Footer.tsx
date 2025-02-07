import React from 'react'

export default function Footer() {
  const APP_HOME_LINK = process.env.NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK
  const APP_HOME_TEXT = process.env.NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT

  return (
    <footer className="bg-fk-black py-4 shadow-md">
      <div className="container mx-auto flex justify-center">
        <p className="text-white underline">
          <a href={APP_HOME_LINK} className="hover:underline">
            {APP_HOME_TEXT}
          </a>
        </p>
      </div>
    </footer>
  )
}

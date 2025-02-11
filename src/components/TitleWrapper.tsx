import React from 'react'

export default function TitleWrapper({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto max-w-5xl rounded-lg bg-white shadow-[0_0_30px_30px_rgba(0,0,0,0.30)]">
      <h2 className="bg-fk-black rounded-t-lg px-4 py-2 text-center text-3xl font-bold text-white">
        {title}
      </h2>
      <div className="px-4 py-6 text-center">{children}</div>
    </div>
  )
}

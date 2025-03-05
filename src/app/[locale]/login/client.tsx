'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import authenticate from '~/actions/admin/authenticate'
import TitleWrapper from '~/components/TitleWrapper'
import { useToastedActionState } from '~/hooks/useToastedActionState'

export default function Login() {
  const t = useTranslations('admin.login')

  const [, formAction, pending] = useToastedActionState(
    authenticate,
    {
      success: false,
      message: ''
    },
    'admin.login'
  )

  return (
    <TitleWrapper title={t('title')}>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder={t('username')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={t('password')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className={
                'bg-fk-yellow text-fk-black w-full cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              }
            >
              {t('login_button')}
            </button>
          </form>
        </div>
      </div>
    </TitleWrapper>
  )
}

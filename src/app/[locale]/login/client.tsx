'use client'

import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

import { authenticate } from '~/actions/admin/authenticate'
import TitleWrapper from '~/components/TitleWrapper'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const t = useTranslations('Login')

  const { execute, isPending, result } = useAction(authenticate, {
    onSuccess: ({ data }) => {
      if (data?.message) {
        toast.success(data.message)
      }
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError)
      } else {
        toast.error(t('wrong_username_or_password'))
      }
    }
  })

  return (
    <TitleWrapper title={t('title')}>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('username')}
              </label>
              <input
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder={t('username')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {result.validationErrors?.fieldErrors.username?.map((error) => (
                <div key={error} className="text-red-500">
                  {error}
                </div>
              ))}
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
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder={t('password')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {result.validationErrors?.fieldErrors.password?.map((error) => (
                <div key={error} className="text-red-500">
                  {error}
                </div>
              ))}
            </div>
            <button
              onClick={() => execute({ username, password })}
              disabled={isPending}
              className={
                'bg-fk-yellow text-fk-black w-full cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              }
            >
              {t('login_button')}
            </button>
          </div>
        </div>
      </div>
    </TitleWrapper>
  )
}

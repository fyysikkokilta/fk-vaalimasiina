'use client'

import { useSetCookie } from 'cookies-next'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

import TitleWrapper from '~/components/TitleWrapper'
import { useRouter } from '~/i18n/routing'
import { trpc } from '~/trpc/client'

export default function Login() {
  const login = trpc.admin.login.authenticate.useMutation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const t = useTranslations('admin.login')
  const setCookie = useSetCookie()
  const router = useRouter()

  const handleLogin = () => {
    login.mutate(
      { username, password },
      {
        onSuccess(token) {
          toast.success(t('login_successful'))
          setCookie('admin-token', token, {
            maxAge: 60 * 60 * 8
          })
          router.replace('/admin')
        }
      }
    )
  }
  return (
    <TitleWrapper title={t('title')}>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <form className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('username')}
              </label>
              <input
                id="username"
                type="text"
                placeholder={t('username')}
                onChange={(e) => setUsername(e.target.value)}
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
                type="password"
                placeholder={t('password')}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={!username || !password}
              className={`bg-fk-yellow text-fk-black w-full rounded-lg px-4 py-2 transition-colors ${
                !username || !password
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:bg-amber-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              }`}
            >
              {t('login_button')}
            </button>
          </form>
        </div>
      </div>
    </TitleWrapper>
  )
}

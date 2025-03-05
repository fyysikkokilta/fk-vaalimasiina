'use client'

import { useLocale } from 'next-intl'
import React from 'react'

import {
  ElectionStep,
  electionStepSettingsEnglish,
  electionStepSettingsFinnish
} from '~/settings/electionStepSettings'

type AdminNavigationProps = {
  electionStep: ElectionStep
  disablePrevious?: boolean
  disableNext?: boolean
  onBack?: string | ((formData: FormData) => void | Promise<void>) | undefined
  onNext: string | ((formData: FormData) => void | Promise<void>) | undefined
  children: React.ReactNode
}

export default function AdminNavigation({
  electionStep,
  disablePrevious = false,
  disableNext = false,
  onBack = async () => {},
  onNext,
  children
}: AdminNavigationProps) {
  const locale = useLocale()

  const stepSettings =
    locale === 'fi'
      ? electionStepSettingsFinnish[electionStep]
      : electionStepSettingsEnglish[electionStep]

  return (
    <form>
      <div className="mb-3">
        <div className="mb-6 flex justify-center">
          <h3 className="text-2xl font-semibold">{stepSettings.title}</h3>
        </div>
        <div className="flex justify-between space-x-6">
          <div>
            {stepSettings.backButton && (
              <button
                formAction={onBack}
                type="submit"
                disabled={disablePrevious}
                className={`text-fk-black rounded-lg px-4 py-2 ${
                  disablePrevious
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-fk-yellow cursor-pointer transition-colors hover:bg-amber-500'
                }`}
              >
                {stepSettings.backButton}
              </button>
            )}
          </div>
          <div>
            {stepSettings.nextButton && (
              <button
                formAction={onNext}
                type="submit"
                disabled={disableNext}
                className={`text-fk-black rounded-lg px-4 py-2 ${
                  disableNext
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-fk-yellow cursor-pointer transition-colors hover:bg-amber-500'
                }`}
              >
                {stepSettings.nextButton}
              </button>
            )}
          </div>
        </div>
      </div>
      {children}
    </form>
  )
}

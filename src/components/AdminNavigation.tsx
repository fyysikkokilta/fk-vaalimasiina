'use client'

import { useLocale } from 'next-intl'
import React from 'react'

import { useToastedActionState } from '~/hooks/useToastedActionState'
import {
  ElectionStep,
  electionStepSettingsEnglish,
  electionStepSettingsFinnish
} from '~/settings/electionStepSettings'

type AdminNavigationProps = {
  electionStep: ElectionStep
  tKey: string
  disablePrevious?: boolean
  disableNext?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBack?: (...args: any[]) => Promise<{ success: boolean; message: string }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNext: (...args: any[]) => Promise<{ success: boolean; message: string }>
  children: React.ReactNode
}

export default function AdminNavigation({
  electionStep,
  tKey,
  disablePrevious = false,
  disableNext = false,
  onBack = async () => Promise.resolve({ success: false, message: '' }),
  onNext,
  children
}: AdminNavigationProps) {
  const locale = useLocale()

  const [, backFormAction, backPending] = useToastedActionState(
    onBack,
    {
      success: false,
      message: ''
    },
    tKey
  )

  const [, nextFormAction, nextPending] = useToastedActionState(
    onNext,
    {
      success: false,
      message: ''
    },
    tKey
  )

  const stepSettings =
    locale === 'fi'
      ? electionStepSettingsFinnish[electionStep]
      : electionStepSettingsEnglish[electionStep]

  if (!stepSettings) {
    return null
  }

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
                formAction={backFormAction}
                type="submit"
                disabled={disablePrevious || backPending}
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
                formAction={nextFormAction}
                type="submit"
                disabled={disableNext || nextPending}
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

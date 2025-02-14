'use client'

import { useLocale } from 'next-intl'
import React from 'react'

import {
  ElectionStep,
  electionStepSettingsEnglish,
  electionStepSettingsFinnish
} from '~/settings/electionStepSettings'
import { trpc } from '~/trpc/client'

type AdminNavigationProps = {
  electionStep: ElectionStep
  disablePrevious?: boolean
  disableNext?: boolean
  onBack?: () => Promise<void>
  onNext: () => Promise<void>
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
  const utils = trpc.useUtils()
  const locale = useLocale()
  const stepSettings =
    locale === 'fi'
      ? electionStepSettingsFinnish[electionStep]
      : electionStepSettingsEnglish[electionStep]

  if (!stepSettings) {
    return null
  }

  const nextStep = async () => {
    if (stepSettings.nextButton && !disableNext) {
      await onNext()
      await utils.admin.elections.findCurrent.invalidate()
    }
  }

  const prevStep = async () => {
    if (
      stepSettings.backButton &&
      stepSettings.previousStep &&
      !disablePrevious
    ) {
      await onBack()
      await utils.admin.elections.findCurrent.invalidate()
    }
  }

  return (
    <>
      <div className="mb-3">
        <div className="mb-6 flex justify-center">
          <h3 className="text-2xl font-semibold">{stepSettings.title}</h3>
        </div>
        <div className="flex justify-between space-x-6">
          <div>
            {stepSettings.backButton && (
              <button
                disabled={disablePrevious}
                onClick={prevStep}
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
                disabled={disableNext}
                onClick={nextStep}
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
    </>
  )
}

import { useLocale } from 'next-intl'
import React from 'react'

import {
  ElectionStep,
  electionStepSettingsEnglish,
  electionStepSettingsFinnish
} from '~/app/[locale]/admin/adminSteps/electionStepSetting'

type AdminNavigationProps = {
  electionStep: ElectionStep
  disablePrevious?: boolean
  disableNext?: boolean
  onBack?: () => void
  onNext: () => void
}

export default function AdminNavigation({
  electionStep,
  disablePrevious = false,
  disableNext = false,
  onBack = () => {},
  onNext
}: AdminNavigationProps) {
  const locale = useLocale()
  const stepSettings =
    locale === 'fi'
      ? electionStepSettingsFinnish[electionStep]
      : electionStepSettingsEnglish[electionStep]

  if (!stepSettings) {
    return null
  }

  const nextStep = () => {
    if (stepSettings.nextButton && !disableNext) {
      onNext()
    }
  }

  const prevStep = () => {
    if (
      stepSettings.backButton &&
      stepSettings.previousStep &&
      !disablePrevious
    ) {
      onBack()
    }
  }

  return (
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
  )
}

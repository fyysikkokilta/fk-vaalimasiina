'use client'

import { useLocale } from 'next-intl'
import type { HookActionStatus } from 'next-safe-action/hooks'
import React from 'react'

import { Button } from '~/components/ui/Button'
import {
  ElectionStep,
  electionStepSettingsEnglish,
  electionStepSettingsFinnish
} from '~/settings/electionStepSettings'

type AdminNavigationProps = {
  electionStep: ElectionStep
  disablePrevious?: boolean
  disableNext?: boolean
  previousActionStatus?: HookActionStatus
  nextActionStatus?: HookActionStatus
  formId?: string
  onBack?: () => void
  onNext?: () => void
  children: React.ReactNode
}

export default function AdminNavigation({
  electionStep,
  disablePrevious = false,
  disableNext = false,
  previousActionStatus,
  nextActionStatus,
  formId,
  onBack = () => {},
  onNext = () => {},
  children
}: AdminNavigationProps) {
  const locale = useLocale()

  const stepSettings =
    locale === 'fi'
      ? electionStepSettingsFinnish[electionStep]
      : electionStepSettingsEnglish[electionStep]

  return (
    <div>
      <div className="mb-3">
        <div className="mb-6 flex justify-center">
          <h3 className="text-2xl font-semibold">{stepSettings.title}</h3>
        </div>
        <div className="flex justify-between space-x-6">
          <div>
            {stepSettings.backButton && (
              <Button
                type="button"
                variant="yellow"
                disabled={disablePrevious}
                actionStatus={previousActionStatus}
                onClick={onBack}
              >
                {stepSettings.backButton}
              </Button>
            )}
          </div>
          <div>
            {stepSettings.nextButton &&
              (formId ? (
                <Button
                  type="submit"
                  form={formId}
                  variant="yellow"
                  disabled={disableNext}
                  actionStatus={nextActionStatus}
                >
                  {stepSettings.nextButton}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="yellow"
                  disabled={disableNext}
                  actionStatus={nextActionStatus}
                  onClick={onNext}
                >
                  {stepSettings.nextButton}
                </Button>
              ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

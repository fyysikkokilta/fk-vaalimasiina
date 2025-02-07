'use client'

import React from 'react'

import ElectionStepProvider from '~/contexts/electionStep/ElectionStepProvider'

import AdminRouter from './adminSteps/AdminRouter'

export default function Admin() {
  return (
    <ElectionStepProvider>
      <AdminRouter />
    </ElectionStepProvider>
  )
}

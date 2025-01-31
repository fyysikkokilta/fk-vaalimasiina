export const electionStepSettingsFinnish = {
  NEW: {
    title: 'Uusi vaali',
    nextButton: 'Luo vaali',
    nextStep: 'PREVIEW' as const
  },
  EDIT: {
    title: 'Muokkaa vaalia',
    backButton: 'Peruuta',
    previousStep: 'PREVIEW' as const,
    nextButton: 'Esikatselu',
    nextStep: 'PREVIEW' as const
  },
  PREVIEW: {
    title: 'Esikatselu',
    backButton: 'Muokkaa vaalia',
    previousStep: 'EDIT' as const,
    nextButton: 'Aloita äänestys',
    nextStep: 'VOTING' as const
  },
  VOTING: {
    title: 'Äänestys',
    backButton: 'Keskeytä äänestys',
    previousStep: 'PREVIEW' as const,
    nextButton: 'Lopeta äänestys',
    nextStep: 'RESULTS' as const
  },
  RESULTS: {
    title: 'Tulokset',
    nextButton: 'Seuraava vaali',
    nextStep: 'NEW' as const
  }
}

export const electionStepSettingsEnglish = {
  NEW: {
    title: 'New election',
    nextButton: 'Create election',
    nextStep: 'PREVIEW' as const
  },
  EDIT: {
    title: 'Edit election',
    backButton: 'Cancel',
    previousStep: 'PREVIEW' as const,
    nextButton: 'Preview',
    nextStep: 'PREVIEW' as const
  },
  PREVIEW: {
    title: 'Preview',
    backButton: 'Edit election',
    previousStep: 'EDIT' as const,
    nextButton: 'Start voting',
    nextStep: 'VOTING' as const
  },
  VOTING: {
    title: 'Voting',
    backButton: 'Abort voting',
    previousStep: 'PREVIEW' as const,
    nextButton: 'End voting',
    nextStep: 'RESULTS' as const
  },
  RESULTS: {
    title: 'Results',
    nextButton: 'Next election',
    nextStep: 'NEW' as const
  }
}

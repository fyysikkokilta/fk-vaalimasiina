export const electionStepSettingsFinnish = {
  NEW: {
    title: 'Uusi vaali',
    nextButton: 'Luo vaali',
    nextStep: 'PREVIEW',
  },
  EDIT: {
    title: 'Muokkaa vaalia',
    backButton: 'Peruuta',
    previousStep: 'PREVIEW',
    nextButton: 'Esikatselu',
    nextStep: 'PREVIEW',
  },
  PREVIEW: {
    title: 'Esikatselu',
    backButton: 'Muokkaa vaalia',
    previousStep: 'EDIT',
    nextButton: 'Aloita äänestys',
    nextStep: 'VOTING',
  },
  VOTING: {
    title: 'Äänestys',
    nextButton: 'Lopeta äänestys',
    nextStep: 'RESULTS',
  },
  RESULTS: {
    title: 'Tulokset',
    nextButton: 'Seuraava vaali',
    nextStep: 'NEW',
  },
}

export const electionStepSettingsEnglish = {
  NEW: {
    title: 'New election',
    nextButton: 'Create election',
    nextStep: 'PREVIEW',
  },
  EDIT: {
    title: 'Edit election',
    backButton: 'Cancel',
    previousStep: 'PREVIEW',
    nextButton: 'Preview',
    nextStep: 'PREVIEW',
  },
  PREVIEW: {
    title: 'Preview',
    backButton: 'Edit election',
    previousStep: 'EDIT',
    nextButton: 'Start voting',
    nextStep: 'VOTING',
  },
  VOTING: {
    title: 'Voting',
    nextButton: 'End voting',
    nextStep: 'RESULTS',
  },
  RESULTS: {
    title: 'Results',
    nextButton: 'Next election',
    nextStep: 'NEW',
  },
}

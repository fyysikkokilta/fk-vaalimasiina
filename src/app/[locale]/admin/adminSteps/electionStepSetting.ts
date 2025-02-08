export enum ElectionStep {
  NEW = 'NEW',
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS'
}

export const electionStepSettingsFinnish = {
  [ElectionStep.NEW]: {
    title: 'Uusi vaali',
    nextButton: 'Luo vaali',
    nextStep: ElectionStep.PREVIEW,
    backButton: null,
    previousStep: null
  },
  [ElectionStep.EDIT]: {
    title: 'Muokkaa vaalia',
    nextButton: 'Esikatselu',
    nextStep: ElectionStep.PREVIEW,
    backButton: 'Peruuta',
    previousStep: ElectionStep.PREVIEW
  },
  [ElectionStep.PREVIEW]: {
    title: 'Esikatselu',
    nextButton: 'Aloita äänestys',
    nextStep: ElectionStep.VOTING,
    backButton: 'Muokkaa vaalia',
    previousStep: ElectionStep.EDIT
  },
  [ElectionStep.VOTING]: {
    title: 'Äänestys',
    nextButton: 'Lopeta äänestys',
    nextStep: ElectionStep.RESULTS,
    backButton: 'Keskeytä äänestys',
    previousStep: ElectionStep.PREVIEW
  },
  [ElectionStep.RESULTS]: {
    title: 'Tulokset',
    nextButton: 'Seuraava vaali',
    nextStep: ElectionStep.NEW,
    backButton: null,
    previousStep: null
  }
}

export const electionStepSettingsEnglish = {
  [ElectionStep.NEW]: {
    title: 'New election',
    nextButton: 'Create election',
    nextStep: ElectionStep.PREVIEW,
    backButton: null,
    previousStep: null
  },
  [ElectionStep.EDIT]: {
    title: 'Edit election',
    nextButton: 'Preview',
    nextStep: ElectionStep.PREVIEW,
    backButton: 'Cancel',
    previousStep: ElectionStep.PREVIEW
  },
  [ElectionStep.PREVIEW]: {
    title: 'Preview',
    nextButton: 'Start voting',
    nextStep: ElectionStep.VOTING,
    backButton: 'Edit election',
    previousStep: ElectionStep.EDIT
  },
  [ElectionStep.VOTING]: {
    title: 'Voting',
    nextButton: 'End voting',
    nextStep: ElectionStep.RESULTS,
    backButton: 'Abort voting',
    previousStep: ElectionStep.PREVIEW
  },
  [ElectionStep.RESULTS]: {
    title: 'Results',
    nextButton: 'Next election',
    nextStep: ElectionStep.NEW,
    backButton: null,
    previousStep: null
  }
}

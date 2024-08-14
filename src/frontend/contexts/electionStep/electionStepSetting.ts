export const electionStepSettings = {
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

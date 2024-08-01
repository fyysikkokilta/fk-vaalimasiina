export const validateUuid = (uuid: string) => {
  const matches = uuid.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  )

  return matches !== null
}

export const validateVoterCode = (voterCode: string) => {
  const matches = voterCode.match(/^VOTER-[0-9A-Za-z]{9}$/)

  return matches !== null
}

// TODO: Maybe use some library for this (like Joi)

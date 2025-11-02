import { db } from '~/db'
import { env } from '~/env'

export const getVoter = async (voterId: string) => {
  // For building without database access
  // This generates empty pages and *.meta files need to be removed to generate them properly
  if (!env.DATABASE_URL) {
    return null
  }

  const voter = await db.query.votersTable.findFirst({
    columns: {
      voterId: true
    },
    where: (votersTable, { eq }) => eq(votersTable.voterId, voterId),
    with: {
      election: {
        with: {
          candidates: {
            columns: {
              candidateId: true,
              name: true
            }
          }
        }
      },
      hasVoted: {
        columns: {
          hasVotedId: true
        }
      }
    }
  })
  if (!voter) {
    return null
  }
  const { election, ...voterWithoutElections } = voter
  return { voter: voterWithoutElections, election }
}

export type VotePageProps = NonNullable<Awaited<ReturnType<typeof getVoter>>>

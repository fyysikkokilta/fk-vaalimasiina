import {
  DataTypes,
  fn,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize'
import Candidate from './candidate'

export interface VoteAttributes {
  voteId: string
  electionId: string
  candidateIds: string[]
}

export interface VoteCreationAttributes
  extends Optional<VoteAttributes, 'voteId'> {}

export class Vote
  extends Model<VoteAttributes, VoteCreationAttributes>
  implements VoteAttributes
{
  public voteId!: string
  public electionId!: Candidate['electionId']
  public candidateIds!: Candidate['candidateId'][]

  public getCandidates!: HasOneGetAssociationMixin<Vote>
  public setCandidates!: HasOneSetAssociationMixin<Vote, number[]>

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date
}

export function initVote(sequelize: Sequelize): void {
  Vote.init(
    {
      voteId: {
        type: DataTypes.UUID,
        defaultValue: fn('gen_random_uuid'),
        allowNull: false,
        primaryKey: true,
      },
      electionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'elections',
          key: 'electionId',
        },
      },
      candidateIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
        // Make this reference the candidate model
      },
    },
    {
      sequelize,
      tableName: 'votes',
      paranoid: true,
    }
  )
}

export default Vote

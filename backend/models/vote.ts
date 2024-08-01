import {
  DataTypes,
  fn,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize'
import Voter from './voter'
import Candidate from './candidate'

export interface VoteAttributes {
  voteId: string
  voterId: string
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
  public voterId!: Voter['voterId']
  public electionId!: Candidate['electionId']
  public candidateIds!: Candidate['candidateId'][]

  public getVoter!: HasOneGetAssociationMixin<Vote>
  public setVoter!: HasOneSetAssociationMixin<Vote, number>
  public createVoter!: HasOneCreateAssociationMixin<Vote>

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
      voterId: {
        // This is not the actual voterId, but a hashed version of it to make the vote anonymous
        type: DataTypes.STRING,
        allowNull: false,
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
      indexes: [
        {
          unique: true,
          fields: ['voterId', 'electionId'],
        },
      ],
      sequelize,
      tableName: 'votes',
      paranoid: true,
    }
  )
}

export default Vote

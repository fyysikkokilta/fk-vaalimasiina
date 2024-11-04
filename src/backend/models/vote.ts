import {
  DataTypes,
  fn,
  HasOneGetAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize'
import Candidate from './candidate'
import Election from './election'

export interface VoteAttributes {
  voteId: string
  ballotId: string
  electionId: string
  candidateId: string
  preferenceNumber: number
}

export interface VoteCreationAttributes
  extends Optional<VoteAttributes, 'voteId'> {}

export class Vote
  extends Model<VoteAttributes, VoteCreationAttributes>
  implements VoteAttributes
{
  public voteId!: string
  public ballotId!: string
  public electionId!: Candidate['electionId']
  public candidateId!: Candidate['candidateId']
  public preferenceNumber!: number

  public getElection!: HasOneGetAssociationMixin<Election>
  public getCandidate!: HasOneGetAssociationMixin<Candidate>

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
      ballotId: {
        type: DataTypes.UUID,
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
      candidateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'candidates',
          key: 'candidateId',
        },
      },
      preferenceNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['ballotId', 'electionId', 'preferenceNumber'],
        },
        {
          unique: true,
          fields: ['ballotId', 'electionId', 'candidateId'],
        }
      ],
      sequelize,
      tableName: 'votes',
      paranoid: true,
    }
  )
}

export default Vote

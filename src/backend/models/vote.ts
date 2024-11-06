import {
  Association,
  CreationOptional,
  DataTypes,
  fn,
  HasOneGetAssociationMixin,
  Model,
  NonAttribute,
  Optional,
  Sequelize,
} from 'sequelize'
import Candidate from './candidate'
import Ballot from './ballot'

export interface VoteAttributes {
  voteId: string
  ballotId: string
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
  public ballotId!: Ballot['ballotId']
  public candidateId!: Candidate['candidateId']
  public preferenceNumber!: number
  public ballot?: NonAttribute<Ballot>
  public candidate?: NonAttribute<Candidate>

  public getBallot!: HasOneGetAssociationMixin<Vote>
  public getCandidate!: HasOneGetAssociationMixin<Candidate>

  public readonly createdAt!: CreationOptional<Date>
  public readonly updatedAt!: CreationOptional<Date>
  public readonly deletedAt!: CreationOptional<Date>

  public static associations: {
    ballot: Association<Vote, Ballot>
    candidate: Association<Vote, Candidate>
  }
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
        references: {
          model: 'ballots',
          key: 'ballotId',
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
          fields: ['ballotId', 'preferenceNumber'],
        },
        {
          unique: true,
          fields: ['ballotId', 'candidateId'],
        }
      ],
      sequelize,
      tableName: 'votes',
      paranoid: true,
    }
  )
}

export default Vote

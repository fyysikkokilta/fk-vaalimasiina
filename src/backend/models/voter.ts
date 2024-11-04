import { DataTypes, fn, Model, Optional, Sequelize } from 'sequelize'

export interface VoterAttributes {
  voterId: string
  electionId: string
  email: string
  votingId: string
  hasVoted: boolean
}

export interface VoterCreationAttributes
  extends Optional<VoterAttributes, 'voterId' | 'votingId'> {}

export class Voter
  extends Model<VoterAttributes, VoterCreationAttributes>
  implements VoterAttributes
{
  public voterId!: string
  public electionId!: string
  public email!: string
  public votingId!: string
  public hasVoted!: boolean

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date
}

export function initVoter(sequelize: Sequelize): void {
  Voter.init(
    {
      voterId: {
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      votingId: {
        type: DataTypes.UUID,
        defaultValue: fn('gen_random_uuid'),
        allowNull: false,
      },
      hasVoted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['electionId', 'email'],
        },
        {
          unique: true,
          fields: ['voterId', 'votingId'],
        }
      ],
      sequelize,
      tableName: 'voters',
      paranoid: true,
    }
  )
}

export default Voter

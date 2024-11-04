import { DataTypes, fn, Model, Optional, Sequelize } from 'sequelize'

export interface VoterAttributes {
  voterId: string
  electionId: string
  email: string
  hasVoted: boolean
}

export interface VoterCreationAttributes
  extends Optional<VoterAttributes, 'voterId'> {}

export class Voter
  extends Model<VoterAttributes, VoterCreationAttributes>
  implements VoterAttributes
{
  public voterId!: string
  public electionId!: string
  public email!: string
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
      ],
      sequelize,
      tableName: 'voters',
      paranoid: true,
    }
  )
}

export default Voter

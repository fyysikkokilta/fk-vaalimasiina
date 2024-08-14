import { DataTypes, fn, Model, Optional, Sequelize } from 'sequelize'

export interface VoterAttributes {
  voterId: string
  identifier: string
  alias: string
  loggedIn: boolean
  active: boolean
}

export interface VoterCreationAttributes
  extends Optional<VoterAttributes, 'voterId'> {}

export class Voter
  extends Model<VoterAttributes, VoterCreationAttributes>
  implements VoterAttributes
{
  public voterId!: string
  public identifier!: string
  public alias!: string
  public loggedIn!: boolean
  public active!: boolean

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
      identifier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alias: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      loggedIn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'voters',
      paranoid: true,
    }
  )
}

export default Voter

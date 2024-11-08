import {
  Association,
  CreationOptional,
  DataTypes,
  fn,
  HasOneGetAssociationMixin,
  Model,
  NonAttribute,
  Optional,
  Sequelize
} from 'sequelize'
import Election from './election'

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
  public electionId!: Election['electionId']
  public email!: string
  public hasVoted!: boolean
  public election?: NonAttribute<Election>

  public getElection!: HasOneGetAssociationMixin<Election>

  public readonly createdAt!: CreationOptional<Date>
  public readonly updatedAt!: CreationOptional<Date>
  public readonly deletedAt!: CreationOptional<Date>

  public static associations: {
    election: Association<Voter, Election>
  }
}

export function initVoter(sequelize: Sequelize): void {
  Voter.init(
    {
      voterId: {
        type: DataTypes.UUID,
        defaultValue: fn('gen_random_uuid'),
        allowNull: false,
        primaryKey: true
      },
      electionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'elections',
          key: 'electionId'
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      hasVoted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['electionId', 'email']
        }
      ],
      sequelize,
      tableName: 'voters',
      paranoid: true
    }
  )
}

export default Voter

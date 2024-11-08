import {
  Association,
  CreationOptional,
  DataTypes,
  fn,
  HasManyGetAssociationsMixin,
  Model,
  NonAttribute,
  Optional,
  Sequelize
} from 'sequelize'
import Candidate from './candidate'
import Ballot from './ballot'
import Voter from './voter'

export enum ElectionStatus {
  CREATED = 'CREATED',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CLOSED = 'CLOSED'
}

export interface ElectionAttributes {
  electionId: string
  title: string
  description: string
  amountToElect: number
  status: ElectionStatus
}

export interface ElectionCreationAttributes
  extends Optional<ElectionAttributes, 'electionId'> {}

export class Election
  extends Model<ElectionAttributes, ElectionCreationAttributes>
  implements ElectionAttributes
{
  public electionId!: string
  public title!: string
  public description!: string
  public amountToElect!: number
  public status!: ElectionStatus
  public candidates?: NonAttribute<Candidate[]>
  public ballots?: NonAttribute<Ballot[]>
  public voters?: NonAttribute<Voter[]>

  public getCandidates!: HasManyGetAssociationsMixin<Candidate>
  public getBallots!: HasManyGetAssociationsMixin<Ballot>
  public getVoters!: HasManyGetAssociationsMixin<Voter>

  public readonly createdAt!: CreationOptional<Date>
  public readonly updatedAt!: CreationOptional<Date>
  public readonly deletedAt!: CreationOptional<Date>

  public static associations: {
    candidates: Association<Election, Candidate>
    ballots: Association<Election, Ballot>
    voters: Association<Election, Voter>
  }
}

export function initElection(sequelize: Sequelize): void {
  Election.init(
    {
      electionId: {
        type: DataTypes.UUID,
        defaultValue: fn('gen_random_uuid'),
        allowNull: false,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      amountToElect: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('CREATED', 'ONGOING', 'FINISHED', 'CLOSED'),
        allowNull: false
      }
    },
    {
      sequelize,
      tableName: 'elections',
      paranoid: true
    }
  )
}

export default Election

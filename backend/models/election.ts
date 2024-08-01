import { DataTypes, fn, Model, Optional, Sequelize } from 'sequelize'

export enum ElectionStatus {
  CREATED = 'CREATED',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CLOSED = 'CLOSED',
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

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date
}

export function initElection(sequelize: Sequelize): void {
  Election.init(
    {
      electionId: {
        type: DataTypes.UUID,
        defaultValue: fn('gen_random_uuid'),
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amountToElect: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('CREATED', 'ONGOING', 'FINISHED', 'CLOSED'),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'elections',
      paranoid: true,
    }
  )
}

export default Election

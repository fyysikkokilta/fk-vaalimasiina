import { DataTypes, fn, Model, Optional, Sequelize } from 'sequelize'

export interface HasVotedAttributes {
  hasVotedId: string
  electionId: string
  voterId: string
}

export interface HasVotedCreationAttributes
  extends Optional<HasVotedAttributes, 'hasVotedId'> {}

export class HasVoted extends Model<HasVotedAttributes, HasVotedCreationAttributes>{
  public hasVotedId!: string
  public electionId!: string
  public voterId!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date
}

export function initHasVoted(sequelize: Sequelize): void {
  HasVoted.init(
    {
      hasVotedId: {
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
      voterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'voters',
          key: 'voterId',
        },
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
      modelName: 'hasVoted',
      paranoid: true,
    }
  )
}
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
import Vote from './vote'

export interface BallotAttributes {
  ballotId: string
  electionId: string
}

export interface BallotCreationAttributes
  extends Optional<BallotAttributes, 'ballotId'> {}

export class Ballot
  extends Model<BallotAttributes, BallotCreationAttributes>
  implements BallotAttributes
{
  public ballotId!: string
  public electionId!: Election['electionId']
  public election?: NonAttribute<Election>
  public votes?: NonAttribute<Vote[]>

  public getElection!: HasOneGetAssociationMixin<Election>

  public readonly createdAt!: CreationOptional<Date>
  public readonly updatedAt!: CreationOptional<Date>
  public readonly deletedAt!: CreationOptional<Date>

  public static associations: {
    election: Association<Ballot, Election>
    votes: Association<Ballot, Vote>
  }
}

export function initBallot(sequelize: Sequelize): void {
  Ballot.init(
    {
      ballotId: {
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
      }
    },
    {
      sequelize,
      tableName: 'ballots',
      paranoid: true
    }
  )
}

export default Ballot

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
import { Election } from './election'
import Ballot from './ballot'

export interface CandidateAttributes {
  candidateId: string
  name: string
  electionId: string
}

export interface CandidateCreationAttributes
  extends Optional<CandidateAttributes, 'candidateId'> {}

export class Candidate
  extends Model<CandidateAttributes, CandidateCreationAttributes>
  implements CandidateAttributes
{
  public candidateId!: string
  public name!: string
  public electionId!: Election['electionId']
  public ballots?: NonAttribute<Ballot[]>
  public election?: NonAttribute<Election>

  public getElection!: HasOneGetAssociationMixin<Candidate>

  public readonly createdAt!: CreationOptional<Date>
  public readonly updatedAt!: CreationOptional<Date>
  public readonly deletedAt!: CreationOptional<Date>

  public static associations: {
    ballots: Association<Candidate, Ballot>
    election: Association<Candidate, Election>
  }
}

export function initCandidate(sequelize: Sequelize): void {
  Candidate.init(
    {
      candidateId: {
        type: DataTypes.UUID,
        defaultValue: fn('gen_random_uuid'),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
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
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['candidateId', 'electionId'],
        },
      ],
      sequelize,
      tableName: 'candidates',
      paranoid: true,
    }
  )
}

export default Candidate

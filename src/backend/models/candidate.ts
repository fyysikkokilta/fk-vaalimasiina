import {
  DataTypes,
  fn,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize'
import { Election } from './election'

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

  public getElection!: HasOneGetAssociationMixin<Candidate>
  public setElection!: HasOneSetAssociationMixin<Candidate, number>
  public createElection!: HasOneCreateAssociationMixin<Candidate>

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date
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

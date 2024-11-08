import Ballot, { initBallot } from './ballot'
import Candidate, { initCandidate } from './candidate'
import Election, { initElection } from './election'
import Vote, { initVote } from './vote'
import Voter, { initVoter } from './voter'
import { Sequelize } from 'sequelize'
import sequelizeConfig from './config'
import { SequelizeStorage, Umzug } from 'umzug'
import migrations from './migrations'

async function runMigration(sequelize: Sequelize) {
  const storage = new SequelizeStorage({ sequelize })

  console.log('Running database migrations')
  const umzug = new Umzug({
    migrations,
    storage,
    logger: console,
    context: sequelize
  })
  await umzug.up()
}

export const initDatabase = async () => {
  const sequelize = new Sequelize(sequelizeConfig)

  try {
    sequelize.authenticate()
    console.log(
      `Connected to ${sequelizeConfig.host} as ${sequelizeConfig.username}.`
    )
  } catch (error) {
    console.error(
      `Error connecting to ${sequelizeConfig.host} as ${sequelizeConfig.username}: ${error}`
    )
    throw error
  }
  initBallot(sequelize)
  initCandidate(sequelize)
  initElection(sequelize)
  initVote(sequelize)
  initVoter(sequelize)

  Candidate.belongsTo(Election, { foreignKey: 'electionId', as: 'election' })
  Election.hasMany(Candidate, {
    foreignKey: 'electionId',
    onDelete: 'CASCADE',
    as: 'candidates'
  })

  Vote.belongsTo(Ballot, { foreignKey: 'ballotId', as: 'ballot' })
  Ballot.hasMany(Vote, {
    foreignKey: 'ballotId',
    onDelete: 'CASCADE',
    as: 'votes'
  })

  Vote.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' })
  Candidate.hasMany(Vote, {
    foreignKey: 'candidateId',
    onDelete: 'CASCADE',
    as: 'votes'
  })

  Voter.belongsTo(Election, { foreignKey: 'electionId', as: 'election' })
  Election.hasMany(Voter, {
    foreignKey: 'electionId',
    onDelete: 'CASCADE',
    as: 'voters'
  })

  await runMigration(sequelize)

  sequelize.sync()
}

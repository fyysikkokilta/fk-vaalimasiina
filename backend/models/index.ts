import Candidate, { initCandidate } from './candidate'
import Election, { initElection } from './election'
import Vote, { initVote } from './vote'
import { initVoter } from './voter'
import { Sequelize } from 'sequelize'
import sequalizeConfig from './config'
import { SequelizeStorage, Umzug } from 'umzug'
import migrations from './migrations'

async function runMigration(sequelize: Sequelize) {
  const storage = new SequelizeStorage({ sequelize })

  console.log('Running database migrations')
  const umzug = new Umzug({
    migrations,
    storage,
    logger: console,
    context: sequelize,
  })
  await umzug.up()
}

export const initDatabase = async () => {
  const config = sequalizeConfig.development
  const sequelize = new Sequelize(config)

  try {
    sequelize.authenticate()
    console.log('Connection has been established successfully.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg = (sequelize.connectionManager as any).config
    console.log(`Connected to ${cfg.host} as ${cfg.username}.`)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg = (sequelize.connectionManager as any).config
    console.error(
      `Error connecting to ${cfg.host} as ${cfg.username}: ${error}`
    )
    throw error
  }
  initCandidate(sequelize)
  initElection(sequelize)
  initVote(sequelize)
  initVoter(sequelize)

  Candidate.belongsTo(Election, { foreignKey: 'electionId', as: 'election' })
  Election.hasMany(Candidate, {
    foreignKey: 'electionId',
    onDelete: 'CASCADE',
    as: 'candidates',
  })

  Vote.belongsTo(Election, { foreignKey: 'electionId', as: 'election' })
  Election.hasMany(Vote, {
    foreignKey: 'electionId',
    onDelete: 'CASCADE',
    as: 'votes',
  })

  await runMigration(sequelize)

  sequelize.sync()
}

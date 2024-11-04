import Vote from '../../models/vote'

export const resetDatabase = async () => {
  await Vote.sequelize!.sync({ force: true })
}

import { Sequelize, Transaction } from 'sequelize'
import { RunnableMigration } from 'umzug'

export type MigrationContext = {
  sequelize: Sequelize
  transaction: Transaction
}

export function defineMigration(
  migration: RunnableMigration<MigrationContext>
): RunnableMigration<Sequelize> {
  return {
    ...migration,
    up: ({ context: sequelize, ...params }) =>
      sequelize.transaction((transaction) =>
        migration.up({
          ...params,
          context: { sequelize, transaction },
        })
      ),
    down:
      migration.down &&
      (({ context: sequelize, ...params }) =>
        sequelize.transaction((transaction) =>
          migration.down!({
            ...params,
            context: { sequelize, transaction },
          })
        )),
  }
}

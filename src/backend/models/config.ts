import { Options } from 'sequelize'

//Postgres
const sequalizeConfig: Options = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'vaalimasiina',
}

export const exportObject = {
  development: sequalizeConfig,
}

export default exportObject

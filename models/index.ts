import Sequelize, { type Model, type ModelStatic } from 'sequelize'
import configByEnvironment from '../config/config.js'
import userModelFactory from './user.js'
import restaurantModelFactory from './restaurant.js'

const env = (process.env.NODE_ENV || 'development') as keyof typeof configByEnvironment
const config: any = configByEnvironment[env]
let sequelize: Sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

type AppModel = ModelStatic<Model> & {
  associate(models: Record<string, unknown>): void
}

const models: { User: AppModel; Restaurant: AppModel } = {
  User: userModelFactory(sequelize, Sequelize.DataTypes),
  Restaurant: restaurantModelFactory(sequelize, Sequelize.DataTypes),
}

const db = { ...models, sequelize, Sequelize }

Object.values(models).forEach(model => model.associate(db))

export default db

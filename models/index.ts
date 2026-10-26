import Sequelize from 'sequelize'
import configByEnvironment from '../config/config.js'
import userModelFactory = require('./user.js')
import restaurantModelFactory = require('./restaurant.js')

const env = (process.env.NODE_ENV || 'development') as keyof typeof configByEnvironment
const config: any = configByEnvironment[env]
const db: Record<string, any> = {}

let sequelize: Sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

type ModelFactory = (sequelize: Sequelize, dataTypes: typeof Sequelize.DataTypes) => any
const modelFactories = [userModelFactory, restaurantModelFactory] as ModelFactory[]

for (const modelFactory of modelFactories) {
  const model = modelFactory(sequelize, Sequelize.DataTypes)
  db[model.name] = model
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db

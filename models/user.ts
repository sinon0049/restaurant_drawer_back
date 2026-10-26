'use strict';
import type Sequelize from 'sequelize'

type SequelizeTypes = typeof Sequelize.DataTypes
const {
  Model
} = require('sequelize');
module.exports = (sequelize: Sequelize, DataTypes: SequelizeTypes) => {
  class User extends Model {
    static associate(models: Record<string, unknown>) {

    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    facebookId: DataTypes.STRING,
    googleId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

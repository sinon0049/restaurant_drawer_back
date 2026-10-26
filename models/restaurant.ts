'use strict';
import type Sequelize from 'sequelize'

type SequelizeTypes = typeof Sequelize.DataTypes
const {
  Model
} = require('sequelize');
module.exports = (sequelize: Sequelize, DataTypes: SequelizeTypes) => {
  class Restaurant extends Model {
    static associate(models: Record<string, unknown>) {
      
    }
  }
  Restaurant.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Restaurant',
  });
  return Restaurant;
};

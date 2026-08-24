'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {

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
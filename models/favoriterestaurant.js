'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FavoriteRestaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FavoriteRestaurant.init({
    userId: DataTypes.INTEGER,
    placeId: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    lastVisit: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'FavoriteRestaurant',
  });
  return FavoriteRestaurant;
};
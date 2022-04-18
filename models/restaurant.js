'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Restaurant.belongsTo(models.User)
    }
  }
  Restaurant.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    isFavorited: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER,
    placeId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Restaurant',
  });
  return Restaurant;
};
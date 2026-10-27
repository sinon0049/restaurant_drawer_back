import Sequelize, { Model, type ModelStatic } from 'sequelize'

const restaurantModelFactory = (sequelize: Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  class Restaurant extends Model {
    static associate(models: Record<string, unknown>) {
      
    }
  }
  (Restaurant as ModelStatic<Model>).init({
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

export default restaurantModelFactory

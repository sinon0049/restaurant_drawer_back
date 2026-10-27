import Sequelize, { Model, type ModelStatic } from 'sequelize'

const userModelFactory = (sequelize: Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  class User extends Model {
    static associate(models: Record<string, unknown>) {

    }
  }
  (User as ModelStatic<Model>).init({
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

export default userModelFactory

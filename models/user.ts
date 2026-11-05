import Sequelize, { Model, type ModelStatic } from 'sequelize'

const userModelFactory = (sequelize: Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  class User extends Model {
    static associate(models: Record<string, unknown>) {
      (User as ModelStatic<Model>).hasMany(models.Restaurant, { foreignKey: 'userId' })
    }
  }
  (User as ModelStatic<Model>).init({
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: 'users_email_unique',
    },
    googleId: {
      type: DataTypes.STRING,
      unique: 'users_google_id_unique',
    },
    facebookId: {
      type: DataTypes.STRING,
      unique: 'users_facebook_id_unique',
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

export default userModelFactory

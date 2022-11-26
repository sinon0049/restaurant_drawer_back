'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'facebookId', Sequelize.STRING)
    await queryInterface.addColumn('Users', 'googleId', Sequelize.STRING)
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('Users', 'facebookId')
     await queryInterface.removeColumn('Users', 'googleId')
  }
};

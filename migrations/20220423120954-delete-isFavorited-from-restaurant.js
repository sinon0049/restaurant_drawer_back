'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Restaurants', 'isFavorited')
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.addColumn('Restaurants', 'isFavorited', Sequelize.BOOLEAN)
  }
};

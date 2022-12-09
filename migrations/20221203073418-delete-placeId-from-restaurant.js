'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Restaurants', 'placeId')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Restaurants', 'placeId', Sequelize.STRING)
  }
};

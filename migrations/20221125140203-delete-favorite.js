'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable('FavoriteRestaurants')
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.createTable('FavoriteRestaurants', {
      userId: {
        type: Sequelize.INTEGER
      },
      placeId: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      lastVisit: {
        type: Sequelize.DATE
      },
    });
  }
};

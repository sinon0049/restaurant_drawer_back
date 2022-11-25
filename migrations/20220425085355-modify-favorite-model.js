'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FavoriteRestaurants', 'restaurantId')
    await queryInterface.addColumn('FavoriteRestaurants', 'placeId', Sequelize.STRING)
    await queryInterface.addColumn('FavoriteRestaurants', 'name', Sequelize.STRING)
    await queryInterface.addColumn('FavoriteRestaurants', 'address', Sequelize.STRING)
    await queryInterface.addColumn('FavoriteRestaurants', 'phone', Sequelize.STRING)
    await queryInterface.addColumn('FavoriteRestaurants', 'lastVisit', Sequelize.DATE)
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('FavoriteRestaurants', 'lastVisit')
     await queryInterface.removeColumn('FavoriteRestaurants', 'phone')
     await queryInterface.removeColumn('FavoriteRestaurants', 'address')
     await queryInterface.removeColumn('FavoriteRestaurants', 'name')
     await queryInterface.removeColumn('FavoriteRestaurants', 'placeId')
     await queryInterface.addColumn('FavoriteRestaurants', 'restaurantId', Sequelize.INTEGER)
  }
};

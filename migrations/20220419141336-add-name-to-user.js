'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'name', Sequelize.STRING)
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('Users', 'name')
  }
};

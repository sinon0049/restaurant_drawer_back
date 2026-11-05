'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'users_email_unique',
    })

    await queryInterface.addConstraint('Users', {
      fields: ['googleId'],
      type: 'unique',
      name: 'users_google_id_unique',
    })

    await queryInterface.addConstraint('Users', {
      fields: ['facebookId'],
      type: 'unique',
      name: 'users_facebook_id_unique',
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('Users', 'users_email_unique')
    await queryInterface.removeConstraint('Users', 'users_google_id_unique')
    await queryInterface.removeConstraint('Users', 'users_facebook_id_unique')
  }
};

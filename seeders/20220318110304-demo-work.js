'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Works',[{
        description: "W1",
        dueDate: new Date("2022-01-01"),
        isDone: false,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: "W2",
        dueDate: new Date("2022-02-01"),
        isDone: false,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: "W3",
        dueDate: new Date("2022-03-01"),
        isDone: false,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('Works', null, {});
  }
};

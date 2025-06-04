'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admins', [{
      id: '50b462a2-4893-4434-ba92-7da4d565f3b2',
      email: 'devdootdevelopment@gmail.com',
      password: '$2b$10$qnDNzHSrZ9clcRcTmu/l1OsME1WP2T19gRv6dgHf2FFvbbpnzAXeq',
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', { email: 'devdootdevelopment@gmail.com' }, {});
  }
};

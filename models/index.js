const sequelize = require('../config/database');
const User = require('./user');

const dbInit = async () => {
  await sequelize.sync({ alter: true }); // Use force: true to reset
  console.log('Database synced');
};

module.exports = { dbInit, User };

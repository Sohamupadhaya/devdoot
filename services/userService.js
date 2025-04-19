const { User } = require('../models');

const createUser = async (userData) => {
  return await User.create(userData);
};

const getAllUsers = async () => {
  return await User.findAll();
};

module.exports = {
  createUser,
  getAllUsers,
};

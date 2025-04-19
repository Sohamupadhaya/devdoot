const { User } = require('../models/user');

const getAllUsers = async () => {
  return await User.findAll();
};

module.exports = {
  getAllUsers,
};

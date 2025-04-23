const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req,res);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    userService.createUser(req,res)
  }
catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyUser = async(req,res) =>{
  try {
    userService.verifyUser(req,res)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
};

const reSendOtp = async(req,res) =>{
  try {
    userService.reSendOtp(req,res)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
};

const getUserById = async(req,res) =>{
  try {
    userService.getUserById(req,res)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

const loginUser = async(req,res) =>{
  try {
    userService.loginUser(req,res)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

const getUserDetails = async(req,res) =>{
  try {
    userService.getUserDetails(req,res)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

const editUser = async(req,res) =>{
  try {
    userService.editUser(req,res)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}



module.exports = {
  getAllUsers,
  createUser,
  verifyUser,
  reSendOtp,
  getUserById,
  loginUser,
  getUserDetails,
  editUser
};

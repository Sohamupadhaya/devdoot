const homeImage = require('../services/homeImageService');

const homeImageById = async (req, res) => {
  try {
    homeImage.homeImageById(req,res)
  }
catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const homeImages = async (req, res) => {
  try {
    homeImage.homeImages(req,res)
  }
catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    homeImageById,
    homeImages,
  };
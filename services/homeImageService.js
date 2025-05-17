const homeImage = require("../models/homeImage");
require("dotenv").config();


const homeImageById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const homeImageData = await homeImage.findByPk(id);

    if (!homeImageData) {
      return res.status(400).json({ message: "Image not found" });
    }

    return res.status(200).json(homeImageData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const homeImages = async (req, res) => {
  try {

    const homeImageData = await homeImage.findAll();

    if (!homeImageData) {
      return res.status(400).json({ message: "no data found" });
    }
    return res.status(200).json({data:homeImageData});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  homeImageById,
  homeImages,
};

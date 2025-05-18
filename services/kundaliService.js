const kundali = require("../models/kundali");
const { kundaliSchema } = require("../validator/kundaliValidation");
require("dotenv").config();
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const createKundali = async (req, res) => {
  try {
    const result = kundaliSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
      return res.status(400).json({ errors });
    }

    const data = result.data;
    const userId = req.user.id;
    const trimmedData = {
      firstName: data.firstName?.trim(),
      lastName: data.lastName?.trim(),
      dob: data.dob?.trim(),
      time: data.time?.trim(),
      gender: data.gender?.trim().toLowerCase(),
      address: data.address?.trim(),
    };
    const name = trimmedData.firstName + " " + trimmedData.lastName;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: trimmedData.address,
          format: "json",
        },
        headers: {
          "User-Agent": "devdoot/1.0 (devdootdevelopment@gmail.com)", // Required by Nominatim
        },
      }
    );

    const locationData = response.data;

    if (!locationData || locationData.length === 0) {
      return res
        .status(400)
        .json({ error: "No location found for the given address" });
    }

    const latitude = locationData[0].lat;
    const longitude = locationData[0].lon;

    const kundaliData = await kundali.create({
      name: name,
      email: trimmedData.email,
      dob: trimmedData.dob,
      time: trimmedData.time,
      gender: trimmedData.gender,
      address: trimmedData.address,
      longitude: longitude,
      latitude: latitude,
      userId: userId,
    });
    if (!kundaliData) {
      return res
        .status(400)
        .json({ error: "Something went wrong while creating user" });
    }
    return res.status(201).json({
      message: "Your kundali will be created soon",
      data: kundaliData,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const kundaliById = async (req, res) => {
  try {
    const id = req.user.id;

    const kundaliData = await kundali.findAll({ where: { userId: id } });

    if (!kundaliData) {
      return res.status(400).json({ message: "Kundali not found" });
    }

    return res.status(200).json(kundaliData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const viewKundali = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Kundali ID is required" });
    }

    const kundaliData = await kundali.findByPk(id);

    if (!kundaliData) {
      return res.status(400).json({ message: "Kundali not found" });
    }

    const fileUrl = kundaliData.kundaliPdf;
    const relativePath = new URL(fileUrl).pathname;
    const filePath = path.join(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: "File not found" });
    }

    return res.status(200).sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getKundaliById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Kundali ID is required" });
    }

    const kundaliData = await kundali.findByPk(id);

    if (!kundaliData) {
      return res.status(400).json({ message: "Kundali not found" });
    }

    return res.status(200).json(kundaliData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createKundali,
  kundaliById,
  viewKundali,
  getKundaliById
};

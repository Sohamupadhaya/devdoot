const kundaliService = require('../services/kundaliService');

const createKundali = async (req, res) => {
  try {
    kundaliService.createKundali(req,res)
  }
catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const kundaliById = async (req, res) => {
  try {
    kundaliService.kundaliById(req,res)
  }
catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewKundali = async (req, res) => {
  try {
    kundaliService.viewKundali(req,res)
  }
catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    createKundali,
    kundaliById,
    viewKundali
  };
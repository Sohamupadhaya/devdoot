const express = require('express')
const Admin = require('../models/admin')
const BookedEvent = require('../models/bookedEvents')
const { generateAccessToken, generateJwtToken } = require("../config/jwt");

const login = async(req, res) => {
    try {
      console.log("Login request received:", req.body);
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                status: 401,
                error: "Authentication failed",
                message: "Invalid credentials or missing user id"
            });
        }
        
        const accessToken = generateJwtToken(req.user.id);
        var response = {
            data: {
                token: accessToken,
                details: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                },
            },
            message: "Admin logged in successfully",
        };
        return res.status(200).json(response);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong, please try again later.",
        })
    }
}

const getEventBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid credentials"
      });
    }

    const bookings = await BookedEvent.findAll({
      order: [
      [BookedEvent.sequelize.literal(`CASE WHEN "scheduledAt" >= NOW() THEN 0 ELSE 1 END`), 'ASC'],
      ['scheduledAt', 'ASC'],
      ['createdAt', 'ASC']
      ]
    });

    return res.status(200).json({
      data: bookings,
      message: "Event bookings fetched successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong, please try again later."
    });
  }
}
module.exports = {
    login,
    getEventBookings
}
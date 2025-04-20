  const { where } = require("sequelize");
  const User = require("../models/user");
  const { validateNotEmpty } = require("../validator/userValidator");
  const bcrypt = require("bcrypt");
  const sendOTP = require('../utils/mailer');

  const getAllUsers = async () => {
    return await User.findAll();
  };
  const createUser = async (req, res) => {
    try {
      const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };
      const { isValid, emptyFields } = validateNotEmpty(req.body);
      const phoneRegex = /^\d{10}$/;
      const dobRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

      if (!isValid) {
        const errors = emptyFields.map((field) => `${field} is not provided`);
        return res.status(400).json({ errors });
      }
      const {
        name,
        email,
        phone,
        dob,
        address,
        gender,
        password,
        confirmPassword,
      } = req.body;

      const trimmedData = {
        name: name?.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        dob: dob?.trim(),
        address: address?.trim(),
        gender: gender?.trim().toLowerCase(),
      };

      const existEmail = await User.findAll({
        where: {
          email: email,
        },
      });
      if (existEmail.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const existPhone = await User.findAll({
        where: {
          phone: trimmedData.phone,
        },
      });
      if (existPhone.length > 0) {
        return res.status(400).json({ error: "Phone-number already exists" });
      }
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ error: "Password and confirm password do not match" });
      }
      if (!phoneRegex.test(trimmedData.phone)) {
        return res
          .status(400)
          .json({ error: "Phone-number must be of 10 digits" });
      }
      if (trimmedData.gender !== "male" && trimmedData.gender !== "female") {
        return res.status(400).json({ error: "Gender should be male or female" });
      }
      if (!dobRegex.test(trimmedData.dob)) {
        return res
          .status(400)
          .json({ error: "DOB must be in YYYY-MM-DD format" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        name:trimmedData.name,
        email:trimmedData.email,
        phone:trimmedData.phone,
        dob:trimmedData.dob,
        address:trimmedData.address,
        gender:trimmedData.gender,
        password:hashedPassword
      });
      if (!user) {
        return res
        .status(400)
        .json({ error: "Something went wrong while creating user" });
      }

      const otp = generateOTP();
      await sendOTP(trimmedData.email, otp, trimmedData.name);

      const { password: _, ...userWithoutPassword } = user.toJSON();
      return res.status(200).json({ message:'user registered',data: userWithoutPassword });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  module.exports = {
    getAllUsers,
    createUser,
  };

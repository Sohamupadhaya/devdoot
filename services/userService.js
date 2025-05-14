const User = require("../models/user");
const {
  userSchema,
  verifySchema,
  resendOTPSchema,
  updateProfileSchema,
  resetPasswordSchema,
  uploadProfileSchema,
} = require("../validator/userValidator");
const bcrypt = require("bcrypt");
const sendOTP = require("../utils/mailer");
const { generateAccessToken, generateJwtToken } = require("../config/jwt");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password", "token"] },
    });
    return res.status(200).json({ message: "Users data", data: users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const generateOTP = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
      return res.status(400).json({ errors });
    }

    const data = result.data;

    const trimmedData = {
      name: data.name?.trim(),
      email: data.email?.trim(),
      phone: data.phone?.trim(),
      dob: data.dob?.trim(),
      address: data.address?.trim(),
      gender: data.gender?.trim().toLowerCase(),
    };

    const existEmail = await User.findOne({
      where: {
        email: trimmedData.email,
      },
    });
    if (existEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    existEmail;
    const existPhone = await User.findOne({
      where: {
        phone: trimmedData.phone,
      },
    });

    if (existPhone) {
      return res.status(400).json({ error: "Phone-number already exists" });
    }
    if (data.password !== data.confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password and confirm password do not match" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await User.create({
      name: trimmedData.name,
      email: trimmedData.email,
      phone: trimmedData.phone,
      dob: trimmedData.dob,
      address: trimmedData.address,
      gender: trimmedData.gender,
      password: hashedPassword,
    });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Something went wrong while creating user" });
    }

    const otp = generateOTP();
    user.token = otp;
    await user.save();
    await sendOTP(trimmedData.email, otp, trimmedData.name);

    const { password, token, ...userDatas } = user.toJSON();
    return res
      .status(200)
      .json({ message: "user registered", data: userDatas });

    const { password: _, ...userWithoutPassword } = user.toJSON();
    return res
      .status(200)
      .json({ message: "user registered", data: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const result = verifySchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
      return res.status(400).json({ errors });
    }

    const data = result.data;

    const trimmedData = {
      email: data.email?.trim(),
      otp: data.otp?.trim(),
    };

    const existEmail = await User.findOne({
      where: {
        email: trimmedData.email,
      },
    });
    if (!existEmail) {
      return res.status(400).json({ error: "Email Not found" });
    }
    if (!existEmail.token || existEmail.verified === 1) {
      return res.status(400).json({ error: "user is already verified" });
    }
    if (!existEmail.token) {
      return res.status(400).json({ error: "No otp is generated" });
    }

    if (existEmail.token !== trimmedData.otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    existEmail.verified = true;
    existEmail.token = null;
    await existEmail.save();

    return res.status(200).json({ message: "user verify successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const reSendOtp = async (req, res) => {
  try {
    const result = resendOTPSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
      return res.status(400).json({ errors });
    }
    const generateOTP = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const data = result.data;

    const trimmedData = {
      email: data.email?.trim(),
      otp: data.otp?.trim(),
    };

    const existEmail = await User.findOne({
      where: { email: trimmedData.email },
    });

    if (!existEmail) {
      return res.status(400).json({ error: "Email not found" });
    }
    if (existEmail.verified) {
      return res
        .status(400)
        .json({ error: "User is already verified, OTP cannot be resent" });
    }

    const newOtp = generateOTP();

    existEmail.token = newOtp;
    await existEmail.save();
    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      res.status(400).json({ error: "user id is not provided in parameters" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(400).json({ error: "user with this id is not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    if (!req.body.email || req.body.email == null) {
      return req.user;
    }

    const accessToken = generateAccessToken({ id: req.user.id });

    const isExistUser = await User.findOne({
      where: {
        id: req.user.id,
        email: req.user.email,
      },
    })

    if (isExistUser) {
      if(isExistUser.verified === false){
        return res.status(400).json({ error: "Bad Request", message:"User is not verified" });
      }
      const response = {
        status: 200,
        message: "User logged in successfully",
        data: {
          token: accessToken,
          id: isExistUser.id,
          name: isExistUser.name,
          email: isExistUser.email,
        },
      };
      return res.status(200).json(response);
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, token, ...userWithoutPassword } = user.toJSON();
    return res.status(200).json({
      data: userWithoutPassword,
      accessToken: req.headers.authorization,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const editUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
      return res.status(400).json({ errors });
    }
    const data = result.data;

    const trimmedData = {
      name: data.name?.trim(),
      phone: data.phone?.trim(),
      dob: data.dob?.trim(),
      address: data.address?.trim(),
      gender: data.gender?.trim(),
    };

    const CheckUser = await User.findByPk(user.id);
    if (!CheckUser) {
      return res
        .status(400)
        .json({ error: "This user is not register with us" });
    }

    const updateUser = await CheckUser.update(
      {
        name: trimmedData.name || CheckUser.name,
        phone: trimmedData.phone || CheckUser.phone,
        dob: trimmedData.dob || CheckUser.dob,
        address: trimmedData.address || CheckUser.address,
        gender: trimmedData.gender || CheckUser.gender,
      },
      { where: { id: user.id } }
    );

    if (!updateUser) {
      return res
        .status(400)
        .json({ error: "Something went wrong while updating user" });
    }

    return res.status(200).json({ data:updateUser, success: "data updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "New password and confirm password do not match" });
    }

    const CheckUser = await User.findByPk(user.id);
    if (!CheckUser) {
      return res
        .status(400)
        .json({ error: "This user is not register with us" });
    }

    const isMatch = await bcrypt.compare(oldPassword, CheckUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await CheckUser.update(
      { password: hashedPassword },
      { where: { id: user.id } }
    );

    return res.status(200).json({ success: "password updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const email = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.token = otp;
    await user.save();

    await sendOTP(email, otp, user.name);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
      return res.status(400).json({ errors });
    }

    const data = result.data;

    const trimmedData = {
      email: data.email?.trim(),
      password: data.password?.trim(),
      confirmPassword: data.confirmPassword?.trim(),
    };
    const { email, password } = trimmedData;

    const user = await User.findOne({ where: {email} });
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (user.token) {
      return res.status(400).json({ error: "first verify otp than change password" });
    }

    await user.update(
      { password: hashedPassword},
      { where: { id: user.id } }
    );

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


const uploadProfile = async (req, res) => {
  try {
    uploadProfileSchema.parse(req.files);

    const id = req.user.id;
    let user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let newPhoto;
    if (req.files && req.files.photo && req.files.photo[0]) {
      newPhoto = process.env.URL + "/" + req.files.photo[0].path.replace(/\\/g, "/");

      if (user.photo && user.photo !== process.env.URL + "/" + req.files.photo[0].path.replace(/\\/g, "/")) {
        const oldPhotoFilename = path.basename(user.photo);
        const oldPhotoPath = path.join(__dirname, "..", "uploads", "profile", oldPhotoFilename);

        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath, (err) => {
            if (err) {
              console.error(`Error deleting file "${oldPhotoFilename}": ${err.message}`);
            }
          });
        }
      }

      try {
        const photoPath = path.join(__dirname, "..", "uploads", "profile");

        // Dynamically import imagemin and its plugins
        const imagemin = (await import("imagemin")).default;
        const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
        const imageminPngquant = (await import("imagemin-pngquant")).default;

        const files = await imagemin([req.files.photo[0].path], {
          destination: photoPath,
          plugins: [
            imageminMozjpeg({ quality: 20 }),
            imageminPngquant({ quality: [0.5, 0.5] }),
          ],
        });
        newPhoto = process.env.URL + "/" + files[0].sourcePath;
      } catch (error) {
        console.error("Imagemin Error:", error);
      }
    }

    if (newPhoto) user.photo = newPhoto;

    const updatedProfile = await user.save();
    if (updatedProfile) {
      return res.status(200).json({ message: "Profile uploaded successfully!" });
    } else {
      return res.status(400).json({ error: "Failed", message: "Updating profile failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error!", message: "Error updating user info" });
  }
};
module.exports = {
  getAllUsers,
  createUser,
  verifyUser,
  reSendOtp,
  getUserById,
  loginUser,
  getUserDetails,
  editUser,
  updatePassword,
  resetPassword,
  email,
  uploadProfile
};

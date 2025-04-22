const { where } = require('sequelize');
const User = require('../models/user');
const { userSchema, verifySchema, resendOTPSchema } = require('../validator/userValidator');
const bcrypt = require('bcrypt');
const sendOTP = require('../utils/mailer');
const {generateAccessToken,generateJwtToken } = require('../config/jwt');

const getAllUsers = async () => {
	return await User.findAll();
};
const createUser = async (req, res) => {
	try {
		const generateOTP = () => {
			return Math.floor(100000 + Math.random() * 900000).toString();
		};

		const result = userSchema.safeParse(req.body);
		if (!result.success) {
			const errors = result.error.errors.map((err) => `${err.path[0]}: ${err.message}`);
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
			return res.status(400).json({ error: 'Email already exists' });
		}
		existEmail;
		const existPhone = await User.findOne({
			where: {
				phone: trimmedData.phone,
			},
		});

		if (existPhone) {
			return res.status(400).json({ error: 'Phone-number already exists' });
		}
		if (data.password !== data.confirmPassword) {
			return res.status(400).json({ error: 'Password and confirm password do not match' });
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
			return res.status(400).json({ error: 'Something went wrong while creating user' });
		}

		const otp = generateOTP();
		user.token = otp;
		await user.save();
		await sendOTP(trimmedData.email, otp, trimmedData.name);


		const { password: _, ...userWithoutPassword } = user.toJSON();
		return res.status(200).json({ message: 'user registered', data: userWithoutPassword });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const verifyUser = async (req, res) => {
	try {
		const result = verifySchema.safeParse(req.body);
		if (!result.success) {
			const errors = result.error.errors.map((err) => `${err.path[0]}: ${err.message}`);
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
			return res.status(400).json({ error: 'Email Not found' });
		}
		if (!existEmail.token || existEmail.verified === 1) {
			return res.status(400).json({ error: 'user is already verified' });
		}
		if (!existEmail.token) {
			return res.status(400).json({ error: 'No otp is generated' });
		}

		if (existEmail.token !== trimmedData.otp) {
			return res.status(400).json({ error: 'Invalid OTP' });
		}

		existEmail.verified = true;
		existEmail.token = null;
		await existEmail.save();

		return res.status(200).json({ message: 'user verify successfully' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const reSendOtp = async (req, res) => {
	try {
		const result = resendOTPSchema.safeParse(req.body);
		if (!result.success) {
			const errors = result.error.errors.map((err) => `${err.path[0]}: ${err.message}`);
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
			return res.status(400).json({ error: 'Email not found' });
		}
		if (existEmail.verified) {
			return res.status(400).json({ error: 'User is already verified, OTP cannot be resent' });
		}

		const newOtp = generateOTP();

		existEmail.token = newOtp;
		await existEmail.save();
    return res.status(200).json({ message: 'OTP resent successfully'});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const loginUser = async (req, res) => {
	try {
		if(!req.body.email || req.body.email == null) {
			return req.user
		}

		const accessToken =  generateAccessToken({ id: req.user.id });

		const isExistUser = await User.findOne({
			where:{
				id: req.user.id,
				email: req.user.email,
			}
		})
		if(isExistUser){
			const  response = {
				status: 200,
				message:"User logged in successfully",
				data:{
					token: accessToken,
					id: isExistUser.id,
					name: isExistUser.name,
					email: isExistUser.email,
					
				}
			}
			return res.status(200).json(response);
		}

	} catch (error) {
		console.error('Error during login:', error);
		return res.status(500).json({ error: error.message });
	}
}

const getUserDetails = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findByPk(userId)
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		const { password, token, ...userWithoutPassword } = user.toJSON();
		return res.status(200).json({ 
			data: userWithoutPassword, 
			accessToken: req.headers.authorization });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getAllUsers,
	createUser,
	verifyUser,
	reSendOtp,
	loginUser,
	getUserDetails
};

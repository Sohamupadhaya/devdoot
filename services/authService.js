const User = require("../models/user");
const bcrypt = require("bcrypt");
const sendOTP = require("../utils/mailer");
const { generateAccessToken, generateJwtToken } = require("../config/jwt");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const _ = require("lodash");
require("dotenv").config();

const googleLogin = async (req, res) => {
  try {
    const state = Buffer.from(
      JSON.stringify({ userId: "456", number: "123" })
    ).toString("base64");
    const oAuth2Client = req.googleOAuthClient;
    const scope = [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ];
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope,
      state,
    });

    return res.status(200).json({
      status: 200,
      data: { authUrl },
      message: "Auth URL generated successfully.",
    });
  } catch (error) {
    console.log(error);
    if (error.response && error.response.data) {
      return res.status(500).json({
        status: 500,
        error: "Google API error",
        message: "Error from google, please try again later.",
      });
    } else {
      return res.status(500).json({
        status: 500,
        error: "Internal server error",
        message: "Something went wrong ,please try again later.",
      });
    }
  }
};

const googleLoginUserRegistration = async (req, res) => {
  try {
    const oAuth2Client = req.googleOAuthClient;
    const { code, timezone } = req.body;

    if (_.isEmpty(code) || _.isEmpty(timezone)) {
      return res.status(400).json({
        status: 400,
        error: "Bad Request",
        message: "code and timezone are required",
      });
    }

    const { tokens } = await oAuth2Client.getToken(code);

    const peopleApiUrl =
      "https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names,photos";
    const googleResponse = await axios.get(peopleApiUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleDetails = googleResponse.data;

    const resourceName = googleDetails.resourceName;
    const googleId = resourceName.match(/\d+/)[0];
    const email = googleDetails.emailAddresses[0].value;

    let userWithEmailAndGoogle = await User.findOne({
      where: { email, googleId },
    });
    let userWithEmailAndNoGoogle = await User.findOne({
      where: { email, googleId: null },
    });

    if (
      userWithEmailAndGoogle?.suspended === true ||
      userWithEmailAndNoGoogle?.suspended === true
    ) {
      return res.status(403).json({
        status: 403,
        error: "forbidden",
        message: "Your account has been suspended by the admin.",
      });
    }

    if (!userWithEmailAndGoogle && !userWithEmailAndNoGoogle) {
      const calendarEmailExists = await User.findOne({
        where: { calendarEmail: email },
      });
      if (calendarEmailExists) {
        return res.status(400).json({
          status: 400,
          error: "Google login error",
          message:
            "This account has already been associated with the app, please try again with a different account.",
        });
      }

      const userInfo = googleDetails;
      const fullName = userInfo.names?.[0]?.familyName
        ? `${userInfo.names[0].givenName} ${userInfo.names[0].familyName}`
        : userInfo.names?.[0]?.givenName || email;

      const createUser = {
        fullName,
        email,
        googleId,
        photo: userInfo.photos?.[0]?.url || null,
        notified: false,
        timeZone: timezone,
        googleRefreshToken: tokens.refresh_token,
      };

      const user = await User.create(createUser);
      const token = generateJwtToken(user.id);

      return res.status(200).json({
        status: 200,
        data: {
          token,
          details: { id: user.id, email: user.email },
        },
        message: "Registered and logged in successfully with Google!",
      });
    }

    if (userWithEmailAndNoGoogle) {
      const dataToUpdate = {
        googleId,
        googleRefreshToken: tokens.refresh_token,
      };
      const [updatedRows] = await User.update(dataToUpdate, {
        where: { id: userWithEmailAndNoGoogle.id },
      });
      if (updatedRows) {
        const token = generateJwtToken(userWithEmailAndNoGoogle.id);
        return res.status(200).json({
          status: 200,
          data: {
            token,
            details: {
              id: userWithEmailAndNoGoogle.id,
              email: userWithEmailAndNoGoogle.email,
            },
          },
          message: "Logged in successfully With Google!",
        });
      }
      return res.status(403).json({
        status: 403,
        error: "Server error",
        message: "Unable to login with google.",
      });
    }

    if (userWithEmailAndGoogle) {
      if (tokens.refresh_token) {
        const dataToUpdate = {
          googleRefreshToken: tokens.refresh_token,
        };
        const [updatedRows] = await User.update(dataToUpdate, {
          where: { id: userWithEmailAndGoogle.id },
        });
        if (!updatedRows) {
          return res.status(400).json({
            status: 400,
            error: "Server error",
            message: "Failed to update user google details.",
          });
        }
      }
      const token = generateJwtToken(userWithEmailAndGoogle.id);
      return res.status(200).json({
        status: 200,
        data: {
          token,
          details: {
            id: userWithEmailAndGoogle.id,
            email: userWithEmailAndGoogle.email,
          },
        },
        message: "Logged in successfully With Google!",
      });
    }

    return res.status(500).json({
      status: 500,
      error: "Unknown error",
      message: "Google login failed.",
    });
  } catch (error) {
    console.log(error);
    if (error.response && error.response.data) {
      return res.status(500).json({
        status: 500,
        error: "Google API error",
        message: "Error from google, please try again later.",
      });
    } else {
      return res.status(500).json({
        status: 500,
        error: "Internal server error",
        message: "Something went wrong, please try again later.",
      });
    }
  }
};

const googleLoginAddGoogleAccount = async (req, res) => {
  try {
    const oAuth2Client = req.googleOAuthClient;
    const { code } = req.body;

    const { tokens } = await oAuth2Client.getToken(code);
    const peopleApiUrl =
      "https://people.googleapis.com/v1/people/me?personFields=emailAddresses";

    const googleResponse = await axios.get(peopleApiUrl, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const googleDetails = googleResponse.data;
    const googleEmail = googleDetails.emailAddresses[0].value;

    // No need to check calendarEmail, just check email if needed
    if (req.user.email !== googleEmail) {
      // Optionally, you can check if another user already has this email
      const emailExists = await User.findOne({
        where: {
          email: googleEmail,
          id: {
            [Op.not]: req.user.id,
          },
        },
      });
      if (emailExists) {
        return res.status(400).json({
          status: 400,
          error: "Bad Request",
          message:
            "This Google account is already associated with another user. Please try a different account.",
        });
      }
    }

    const updateUser = await User.update(
      {
        email: googleEmail, // update main email if needed
        googleRefreshToken: tokens.refresh_token,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    if (updateUser) {
      return res.status(200).json({
        status: 200,
        data: null,
        message:
          "Google account has been successfully added.",
      });
    } else {
      return res.status(400).json({
        status: 400,
        error: "Server error",
        message: "Error while adding google account.",
      });
    }
  } catch (error) {
    console.log(error);
    if (error.response && error.response.data) {
      return res.status(500).json({
        status: 500,
        error: "Google API error",
        message: "Error from google, please try again later.",
      });
    } else {
      return res.status(500).json({
        status: 500,
        error: "Internal server error",
        message: "Something went wrong ,please try again later.",
      });
    }
  }
};

module.exports = {
  googleLogin,
  googleLoginUserRegistration,
  googleLoginAddGoogleAccount,
};
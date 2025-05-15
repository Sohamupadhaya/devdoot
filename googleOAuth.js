const { OAuth2Client } = require("google-auth-library");

//oAuth initiation
const credentials = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
};
const oAuth2Client = new OAuth2Client(
  credentials.clientId,
  credentials.clientSecret
);

async function setRedirectURIs(req, res, next) {
  // Check request domain
  let redirectUri;
  if (req.headers.host === "localhost:5000") {
    redirectUri = "http://localhost:5000/login/google";
  } else if (req.headers.origin === "http://localhost:5173") {
    redirectUri = "http://localhost:5173/login/google";
  } else if (req.headers.origin === "http://localhost:3000") {
    redirectUri = "http://localhost:3000/login/google";
  } else if (req.headers.origin === "https://zippyplan-yoddha.vercel.app/") {
    redirectUri = "https://zippyplan-yoddha.vercel.app//login/google";
  }
  // Set the dynamic redirect URI in OAuth client options
  oAuth2Client.redirectUri = redirectUri;
  // Attach OAuth client to request object
  req.googleOAuthClient = oAuth2Client;

  next();
}

module.exports = { setRedirectURIs };

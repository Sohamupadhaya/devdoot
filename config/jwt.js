const jwt = require('jsonwebtoken');
require ('dotenv').config();

function generateJwtToken(userId){
    const payload = { id: req.user.id}
    const options = { expiresIn: '7d' }; 
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    return token;
}

function generateAccessToken (userId){
    const payload = { userId };
    const options = { expiresIn: '7d' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    return token;
}

module.exports = {
    generateJwtToken,
    generateAccessToken
};
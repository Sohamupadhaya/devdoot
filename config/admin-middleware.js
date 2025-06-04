const passport = require("passport")
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require("bcryptjs");
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Admin = require('../models/admin');

require('dotenv').config()
const { adminLoginSchema } = require('../validator/adminValidator');
const { ValidationError } = require("sequelize");
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    Admin.findByPk(id, (err, user) => {
        done(err, user)
    })
});

// use local strategy to authenticate admin with email and password
passport.use('admin', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true // Add this to access the request object
}, async (req, email, password, done) => {
    try {
        console.log("Login attempt:", email); // Debug log
        
        if (!email || !password) {
            return done(null, false, { 
                status: 400,
                message: "Email and password are required" 
            });
        }

        const admin = await Admin.findOne({ where: { email } });
        
        if (!admin) {
            console.log("Admin not found for email:", email);
            return done(null, false, { 
                status: 404,
                message: "Admin not found" 
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            console.log("Password mismatch for email:", email);
            return done(null, false, { 
                status: 401,
                message: "Invalid credentials" 
            });
        }

        console.log("Login successful for:", email);
        return done(null, admin);
        
    } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
    }
}));

// use JWT strategy to authenticate admin with a JWT Token
passport.use('admin-jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET 
}, async (payload, done) => {
    try {
        const admin = await Admin.findOne({ where: { id: payload.userId } })
        if (!admin) {
            return done(null, false, { message: 'User not found' })
        }
        return done(null, admin)
    } catch (error) {
        console.log(error);
        return done(error)
    }
}
));

// ADMIN AUTHENTICATE PROTOCOL
function authenticateAdminJWT(req, res, next) {
    passport.authenticate('admin-jwt', { session: false }, (err, user, info) => {
        if (info && (info.message.includes("invalid") || info.message.includes("expired"))) {
            var response = {
                status: 401,
                error: "Invalid",
                message: "Token is invalid or empty.",
            }
            return res.status(401).json(response);
        }
        if (err) {
            return next(err)
        }
        req.user = user
        next()
    })(req, res, next)
}

const validateAdminLogin = (req, res, next) => {
    try {
        const validationResult = adminLoginSchema.safeParse(req.body);
        console.log(req.body);
        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map((err) => err.message);
            return res.status(400).json({ 
                status: 400, 
                error: "Validation Error",
                message: errorMessages.join(", ") 
            });
        }
        next();
    } catch (error) {
        console.error("Validation error:", error);
        return res.status(400).json({
            status: 400,
            error: "Bad Request",
            message: "Invalid request format"
        });
    }
}
module.exports = {
  authenticateAdminLocal: passport.authenticate("admin", { session: false }),
  authenticateAdminJWT: authenticateAdminJWT,
    validateAdminLogin: validateAdminLogin,
};
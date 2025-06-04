const passport= require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user'); 
require ('dotenv').config();
const { loginSchema } = require('../validator/userValidator');

passport.serializeUser((user, done) => {
    done(null, user.id);
    });

passport.deserializeUser((id,done)=>{
    User.findByPk(id,(err,user)=>{
        done(err,user);
    });
    });


passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            if (!email || email == null) {
                return done(null, false, { message: 'Email is required' });
            }
            console.log('email:', email);

            var user = await User.findOne({ where: { email } });
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }                                                                                                                                                     


            if(user && !user.password){
                var response = {
                    status: 400,
                    error: 'Bad Request',
                    message: 'You have to login with google or reset your password',
                };
                return done (null, false, response);
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, user);
            });
        } catch (error) {
            console.error('Error during authentication:', error);
            return done(error);
        }
    }

))

function authenticateLocalWithMessage(req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({
                status: 401,
                error: 'Unauthorized',
                message: 'Invalid email or password!',
            });
        }
        req.user = user;
        next();
    })(req, res, next);
}


passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
},
    async (jwtPayload, done)=>{
        try {
            const user = await User.findOne({
                where:{
                    id: jwtPayload.userId.id,
                }
            });
            if(!user){
                return done(null, false, { message: 'User not found' });
            }
            return done(null, user);    

        } catch (error) {
            console.error('Error during JWT authentication:', error);
            return done(error, false);
            
        }

    }));

    function authenticateJWT(req, res, next) {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (info && (info.message.includes('invalid') || info.message.includes('expired'))) {
                return res.status(401).json({
                    status: 401,
                    error: 'Invalid',
                    message: 'Token is invalid or empty.',
                });
            }
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({
                    status: 401,
                    error: 'Unauthorized',
                    message: 'You are not authorized to access this resource.',
                });
            }
            req.user = user;
            next();
        })(req, res, next); 
    }

    const validateLogin = (req, res, next) => {
        const validationResult = loginSchema.safeParse(req.body);
        if (!validationResult.success) {
          const errorMessages = validationResult.error.errors.map((err) => err.message);
          return res.status(400).json({ status: 400, message: errorMessages.join(", ") });
        }
        next();
      };

    module.exports ={
        authenticateLocal: passport.authenticate('local', { session: false }),
        authenticateJWT: authenticateJWT,
        validateLogin: validateLogin,
        authenticateLocalWithMessage: authenticateLocalWithMessage,
    }

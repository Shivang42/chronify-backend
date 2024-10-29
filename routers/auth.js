const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../model/userModel.js');
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const { validationResult } = require("express-validator");

// const conn =  require("../model/model.js");
const jwtinit = require("../strategies/strategy.js");

// Change the algo to rs356 with async tokens
const signAccessToken = (payload) => jwt.sign(payload, process.env.JWT_KEY);

jwtinit(Users);

const AuthRouter = express.Router();
AuthRouter.use(passport.initialize())
AuthRouter.use(passport.session());
AuthRouter.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))


AuthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'https://www.googleapis.com/auth/calendar'] }), (req, res) => {

});
AuthRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: `http://${process.env.APP_URL}/?signin=false` }), async (req, res, next) => {
    try {
        if (req.isAuthenticated) {
            res.redirect(`http://${process.env.APP_URL}/dashboard${req.user?'?signin=true&token='+signAccessToken(req.user):''}`);
        }
    }
    catch (e) {
        console.error(e);
        res.redirect(`http://${process.env.APP_URL}?signin=false`);
    }
}, async (req, res) => {
    res.redirect(`http://${process.env.APP_URL}?signupgoogle=true`);

})

module.exports = AuthRouter;
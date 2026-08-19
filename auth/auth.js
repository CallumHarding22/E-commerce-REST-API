const express = require('express');
const authRouter = express.Router();

// Wrap your route configuration in a function, just like your strategy
module.exports = function(passport) {
    authRouter.route('/login')
    .post(passport.authenticate('local', {
        failureRedirect: '/',
    }), function(req, res) {
        res.status(200).json({ message: "Authentication successful" });
    });

    return authRouter;
};
const express = require('express');
const authRouter = express.Router();

// Wrap your route configuration in a function, just like your strategy
module.exports = function(passport) {

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in a user
 *     description: Authenticates a user using their email and password. On successful authentication, establishes a login session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: callum@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       '200':
 *         description: Authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication successful
 *       '302':
 *         description: Authentication failed; redirects to the configured failure URL.
 */

    authRouter.route('/login')
    .post(passport.authenticate('local', {
        failureRedirect: '/',
    }), function(req, res) {
        res.status(200).json({ message: "Authentication successful" });
    });

    return authRouter;
};
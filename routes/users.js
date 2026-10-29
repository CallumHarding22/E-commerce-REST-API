const express = require("express");
const router = express.Router();
const db = require("../config/db");


/**
 * @openapi
 * /user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the current user's information
 *     description: Retrieves the authenticated user's profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Internal server error.
 */

router.get("/", async (req, res, next) => {
  try {
    const id = req.user.ID;
    const users = await db.query(
      'SELECT "firstName", "lastName", "email" FROM users WHERE "ID" = $1;',
      [id],
    );
    res.status(200).json(users.rows);
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});

/**
 * @openapi
 * /user:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update the current user's information
 *     description: Updates the authenticated user's first name, last name, and email address.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Callum
 *               lastName:
 *                 type: string
 *                 example: Harding
 *               email:
 *                 type: string
 *                 format: email
 *                 example: callum@example.com
 *     responses:
 *       '201':
 *         description: User information updated successfully.
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Failed to update user information.
 */

router.put("/", async (req, res, next) => {
  const user = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET "firstName" = $2, "lastName" = $3, "email" = $4 WHERE "ID" = $1',
      [req.user.ID, user.firstName, user.lastName, user.email],
    );
  } catch (err) {
    res.status(500).send({ message: err });
  }

  res.status(201).send({ message: "user information updated successfully!" });
});

module.exports = router;

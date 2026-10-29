const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieves all products available in the database.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Products retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Product record from the database.
 *                 properties:
 *                   ID:
 *                     type: integer
 *                     example: 1
 *                   description:
 *                     type: string
 *                     example: Wireless headphones
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Internal server error.
 */

router.get("/", async (req, res, next) => {
  try {
    const products = await db.query("SELECT * FROM products;");
    res.status(200).json(products.rows);
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by ID
 *     description: Retrieves the product matching the specified product ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the product to retrieve.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       '200':
 *         description: Product query completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Product record from the database.
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Internal server error.
 */

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const products = await db.query('SELECT * FROM products WHERE "ID" = $1', [
      id,
    ]);
    res.status(200).json(products.rows);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;

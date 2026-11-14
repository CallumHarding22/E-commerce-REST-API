const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all orders belonging to the authenticated user
/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders belonging to the authenticated user
 *     description: Retrieves all orders associated with the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Orders retrieved successfully. Returns an empty array if no orders exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderID:
 *                     type: integer
 *                     example: 42
 *                   orderDate:
 *                     type: string
 *                     format: date-time
 *                   total:
 *                     type: string
 *                     example: "59.98"
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Internal server error.
 */
router.get("/", async (req, res) => {
  try {
    const orders = await db.query(
      'SELECT "orderID", "orderDate", "total" FROM "orders" WHERE "userID" = $1',
      [req.user.ID],
    );

    return res.status(200).json(orders.rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Get a specific order belonging to the authenticated user
/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get a specific order
 *     description: Retrieves a specific order belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the order to retrieve.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 42
 *     responses:
 *       '200':
 *         description: Order retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderID:
 *                   type: integer
 *                   example: 42
 *                 orderDate:
 *                   type: string
 *                   format: date-time
 *                 total:
 *                   type: string
 *                   example: "59.98"
 *       '400':
 *         description: Invalid order ID.
 *       '401':
 *         description: Authentication required.
 *       '404':
 *         description: Order not found or does not belong to the authenticated user.
 *       '500':
 *         description: Internal server error.
 */
router.get("/:id", async (req, res) => {
  try {
    const orderID = Number(req.params.id);

    if (!Number.isInteger(orderID) || orderID <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await db.query(
      'SELECT "orderID", "orderDate", "total" FROM "orders" WHERE "userID" = $1 AND "orderID" = $2',
      [req.user.ID, orderID],
    );

    if (order.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json(order.rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * @openapi
 * /cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Get the current user's cart
 *     description: Retrieves the authenticated user's cart items, including product IDs, quantities, and product descriptions.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Cart retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productID:
 *                     type: integer
 *                     example: 1
 *                   Quantity:
 *                     type: integer
 *                     example: 2
 *                   description:
 *                     type: string
 *                     example: Wireless headphones
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Failed to retrieve cart.
 */

router.get("/", async (req, res, next) => {
  try {
    let cartID = await db.query('SELECT "ID" FROM cart WHERE "userID" = $1;', [
      req.user.ID,
    ]);

    console.log(cartID.rows[0].ID);
    cartID = cartID.rows[0].ID;
    const cart = await db.query(
      `SELECT
        ci."productID",
        ci."Quantity",
        p."description"
     FROM "cartItem" AS ci
     JOIN "products" AS p
        ON ci."productID" = p."ID"
     WHERE ci."cartID" = $1`,
      [cartID],
    );

    let result = cart.rows;
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

/**
 * @openapi
 * /cart:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add a product to the cart
 *     description: Adds a product to the authenticated user's cart. If the product is already in the cart, its quantity is increased.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productID
 *               - quantity
 *             properties:
 *               productID:
 *                 type: integer
 *                 description: ID of the product to add.
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantity of the product to add.
 *                 example: 2
 *     responses:
 *       '201':
 *         description: Product added to the cart successfully.
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Failed to add product to cart.
 */

router.post("/", async (req, res, next) => {
  try {
    const quantity = req.body.quantity;
    const item = req.body.productID;
    let cartID = await db.query('SELECT "ID" FROM cart WHERE "userID" = $1;', [
      req.user.ID,
    ]);
    cartID = cartID.rows[0].ID;
    await db.query(
      `INSERT INTO "cartItem" ("cartID", "productID", "Quantity")
        VALUES ($1, $2, $3)
        ON CONFLICT ("cartID", "productID")
        DO UPDATE
        SET "Quantity" = "cartItem"."Quantity" + EXCLUDED."Quantity";`,
      [cartID, item, quantity],
    );
    res.status(201).send({ message: "Item added to the cart successfully!" });
  } catch (err) {
    console.error(err);

    return res.status(500).send({
      message: err.message,
      code: err.code,
    });
  }
});

/**
 * @openapi
 * /cart/{productID}:
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Decrease or remove a cart item
 *     description: Decreases the product quantity by one. If its quantity is one, removes the product from the cart entirely.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productID
 *         in: path
 *         required: true
 *         description: ID of the product to decrease or remove.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       '200':
 *         description: Cart item quantity decreased or item removed successfully.
 *       '401':
 *         description: Authentication required.
 *       '404':
 *         description: Cart or product item not found.
 *       '500':
 *         description: Failed to update cart.
 */

router.delete("/:productID", async (req, res, next) => {
  try {
    const productID = req.params.productID;

    // Get the user's cart ID
    const cartResult = await db.query(
      'SELECT "ID" FROM cart WHERE "userID" = $1',
      [req.user.ID],
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).send({
        message: "Cart not found",
      });
    }

    const cartID = cartResult.rows[0].ID;

    // Get the cart item
    const itemResult = await db.query(
      'SELECT "Quantity" FROM "cartItem" WHERE "cartID" = $1 AND "productID" = $2',
      [cartID, productID],
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).send({
        message: "Item not found in cart",
      });
    }

    const quantity = itemResult.rows[0].Quantity;

    if (quantity > 1) {
      // Decrease quantity by 1
      await db.query(
        'UPDATE "cartItem" SET "Quantity" = "Quantity" - 1 WHERE "cartID" = $1 AND "productID" = $2',
        [cartID, productID],
      );

      return res.status(200).send({
        message: "Item quantity decreased successfully",
      });
    } else {
      // Quantity is 1, so remove the item
      await db.query(
        'DELETE FROM "cartItem" WHERE "cartID" = $1 AND "productID" = $2',
        [cartID, productID],
      );

      return res.status(200).send({
        message: "Item removed from cart",
      });
    }
  } catch (err) {
    console.error(err);

    return res.status(500).send({
      message: err.message,
    });
  }
});

/**
 * @openapi
 * /cart/checkout:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Checkout the current user's cart
 *     description: Initiates checkout for the authenticated user's cart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Checkout completed successfully.
 *       '201':
 *         description: The cart is empty; there are no items to checkout.
 *       '401':
 *         description: Authentication required.
 *       '500':
 *         description: Failed to process checkout.
 */

router.post("/checkout", async (req, res, next) => {
  const cartID = (
    await db.query('SELECT "ID" FROM cart WHERE "userID" = $1;', [req.user.ID])
  ).rows.ID;

  const cart = await db.query(
    'SELECT * FROM "cartItems" WHERE "cartID" = $1;',
    [cartID],
  );

  if (cart.rows.length === 0) {
    console.log("There are no items in the cart for checkout");
    res
      .status(201)
      .send({ message: "There are no items in the cart for checkout" });
  } else {
  }
});
module.exports = router;

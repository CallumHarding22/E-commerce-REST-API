const express = require("express");
const router = express.Router();
const db = require("../config/db");

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

router.post("/", async (req, res, next) => {
  try {
    const quantity = req.body.quantity;
    const item = req.body.productID;
    let cartID = await db.query('SELECT "ID" FROM cart WHERE "userID" = $1;', [
      req.user.ID,
    ]);
    cartID = cartID.rows[0].ID;
    await db.query(`INSERT INTO "cartItem" ("cartID", "productID", "Quantity")
        VALUES ($1, $2, $3)
        ON CONFLICT ("cartID", "productID")
        DO UPDATE
        SET "Quantity" = "cartItem"."Quantity" + EXCLUDED."Quantity";`,[cartID, item, quantity]);
    res.status(201).send({ message: "Item added to the cart successfully!" });
  } catch (err) {
   console.error(err);

    return res.status(500).send({
        message: err.message,
        code: err.code
    });
  }
});

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

router.post("/checkout", async (req, res , next)=>{
    const cartID = (await db.query('SELECT "ID" FROM cart WHERE "userID" = $1;', [req.user.ID])).rows.ID;

    const cart = await db.query('SELECT * FROM "cartItems" WHERE "cartID" = $1;', [cartID]);

    if (cart.rows.length === 0){
        console.log("There are no items in the cart for checkout");
        res.status(201).send({"message": "There are no items in the cart for checkout"});
    }
    else{
        
    }
})
module.exports = router;

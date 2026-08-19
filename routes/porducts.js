const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get('/', async (req, res, next)=>{
     try{
            const products = await db.query("SELECT * FROM products;");
            res.status(200).json(products.rows);
        }catch(e){
            res.status(500).send("Internal server error");
        }
})

router.get('/:id', async(req, res, next)=>{
    const id = req.params.id;
    try{
            const products = await db.query('SELECT * FROM products WHERE "ID" = $1', [id]);
            res.status(200).json(products.rows);
        }catch(e){
            console.log(e);
            res.status(500).send("Internal server error");
        }
})
module.exports = router;
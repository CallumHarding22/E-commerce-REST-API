const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res , next)=>{
    try{
        const id = req.user.ID;
        const users = await db.query('SELECT "firstName", "lastName", "email" FROM users WHERE "ID" = $1;', [id]);
        res.status(200).json(users.rows);
    }catch(e){
        res.status(500).send("Internal server error");
    }
})

module.exports = router;
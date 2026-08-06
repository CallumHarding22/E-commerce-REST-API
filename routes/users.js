const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res , next)=>{
    try{
        const users = await db.query("SELECT * FROM users;");
        res.status(200).json(users.rows);
    }catch(e){
        res.status(500).send("Internal server error");
    }
})

module.exports = router;
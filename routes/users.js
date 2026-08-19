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

router.put("/", async (req, res, next)=>{
    const user = req.body;
    try{
        const result = await db.query('UPDATE users SET "firstName" = $2, "lastName" = $3, "email" = $4 WHERE "ID" = $1', [req.user.ID, user.firstName, user.lastName, user.email]);

    }
    catch(err){
        res.status(500).send({"message": err});
    }

    res.status(201).send({"message": "user information updated successfully!"});
    
})

module.exports = router;
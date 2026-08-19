const bcrypt = require("bcrypt");
const db = require("../config/db");
const express = require("express");
const router = express.Router();


const saltRounds = 10;
router.post("/", async (req, res, next)=>{
    const user = {
        "email": req.body.email,
        "password": req.body.password,
        "firstName": req.body.firstName,
        "lastName": req.body.lastName
    } 

    bcrypt.hash(user.password, saltRounds, (err, hash)=>{
        if(err){
            console.log(err);
            return;
        }

        user.password = hash;
    })
    //check if user with that email already exists within the db

    let u = await db.query("SELECT * FROM users WHERE email = $1", [user.email]);
    u = u.rows[0];
    if(!u){
        console.log("no existing user user found in db, continuing with registration");
        try{
            db.query("INSERT INTO users VALUES(DEFAULT,$1,$2,$3,$4)", [user.firstName, user.lastName, user.password, user.email]);
            
        }
        catch(err)
        {
            res.status(500).send({"message": err});
        }

        res.status(201).send({"message": "user registered successfully!"});
    }

    
    
}) 

module.exports = router;
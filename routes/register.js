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
            await db.query("INSERT INTO users VALUES(DEFAULT,$1,$2,$3,$4);", [user.firstName, user.lastName, user.password, user.email]);


            // Need to create a cart for user on registration. AKA assign a cartID to the userID within table cart
            //so get the newly created userID from the users table and then use that to assign a cartID to the user
            let id = await db.query('SELECT "ID" FROM users WHERE email = $1', [user.email])
            id = id.rows[0].ID;

            await db.query('INSERT INTO cart VALUES(DEFAULT,$1);',[id]);
            res.status(201).send({"message": "user registered successfully!"});
        }
        catch(err)
        {
            res.status(500).send({"message": err});
        }

        
    }else{
        return res.status(409).send({
        message: "A user with that email already exists"
    });
    }

    
    
}) 

router.post("/checkout", async (req, res, next)=>{
    
})

module.exports = router;
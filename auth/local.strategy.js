const LocalStrategy = require("passport-local").Strategy;
const db = require("../config/db");
const bcrypt = require("bcrypt");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          console.log("👉 STRATEGY RUNNING: Checking email:", email);

          console.log("👉 ABOUT TO QUERY DATABASE...");
          const res = await db.query("SELECT * FROM users WHERE email = $1", [
            email,
          ]);
          console.log("👉 DATABASE RESPONDED! Rows count:", res.rows.length);

          const u = res.rows[0];
          // 💡 FIXED: Use done(null, false) instead of res.status()
          if (!u) {
            console.log("User does not exist");
            return done(null, false, { message: "User does not exist" });
          }
          
          bcrypt.compare(password, u.password, (err,result)=>{
            if(err){
              console.log(err);
              return;
            }

            if(result){
              return done(null, u);
            }else{
              return done(null, false, { message: "Incorrect password." });
            }
          });
        } catch (err) {
          // 💡 FIXED: Use done(err) instead of next(err)
          return done(err);
        }
      },
    ),
  );
};

const passport = require('passport');
const db = require("../config/db");
module.exports = function(app) {
    // 1. Initialize passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
    console.log("initializing passport");
    // 2. Load local strategy (passing passport into it)
    require('./local.strategy.js')(passport);

    // 3. Setup serialization for sessions
    passport.serializeUser((user, done) => {
        done(null, user.ID); 
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const res = await db.query('SELECT * FROM users WHERE "ID" = $1', [id]);
            done(null, res.rows[0]); 
        } catch (err) {
            done(err);
        }
    });
};
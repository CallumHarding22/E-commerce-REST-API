const express = require('express');
const app = express();
const port = 3000;

// 💡 FIX 1: Import the main passport package directly into index.js
const passport = require('passport'); 

const userRouter = require('./routes/users');
// 💡 FIX 2: Rename this variable to 'authRouterSetup' because it is a function, not a router yet
const authRouterSetup = require('./auth/auth.js'); 
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const registerRouter = require("./routes/register");
const productsRouter = require("./routes/porducts.js")

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession({
  secret: 'VVRcSgl81KqRFtCMJFuZ7yKdYXO74QFc9naRHrT6cdBTY3vc',
  resave: false,             
  saveUninitialized: false,  
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));
app.use(cors());

// 1. FIRST: Run passport configuration to register the strategies
require('./auth/passport.js')(app);

// 2. SECOND: Execute the route function by passing passport into it
const authRouter = authRouterSetup(passport);

// 3. THIRD: Use the freshly generated router
app.use('/auth', authRouter);
app.use("/users", userRouter);
app.use("/register", registerRouter);
app.use("/products", productsRouter)

app.get('/', function (req, res) {
    if (req.user) {
       res.redirect('/users');
    } else {
       console.log("user needs to sign in");
       res.send("user needs to sign in");
    }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
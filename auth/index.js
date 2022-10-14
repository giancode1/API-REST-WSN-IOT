const passport = require("passport");

const LocalStrategy = require("./strategies/local"); 
const JwtStrategy = require("./strategies/jwt");

passport.use(LocalStrategy);
passport.use(JwtStrategy);



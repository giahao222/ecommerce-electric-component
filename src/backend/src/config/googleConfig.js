require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/users");
const Role = require("../models/roles");
const passport = require("passport");
const bcrypt = require("bcrypt");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GG_CLIENT_ID,
      clientSecret: process.env.GG_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          return done(null, existingUser);
        }
        console.log(profile);
        const hashedPassword = await bcrypt.hash("123456", 10);
        const id_role = await Role.findOne({ name: "User" });
        const newUser = new User({
          full_name: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
          password: hashedPassword,
          id_roles: id_role,
          verify_email: null
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Save user info to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieve user info from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

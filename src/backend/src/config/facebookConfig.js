const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/users");
const Role = require("../models/roles");
const bcrypt = require("bcrypt");
require("dotenv").config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(profile._json.picture.data);
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          const hashedPassword = await bcrypt.hash("123456", 10);
          const id_role = await Role.findOne({ name: "User" });
          const newUser = new User({
            full_name: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            password: hashedPassword,
            id_roles: id_role,
            verify_email: null,
          });
          await newUser.save();
        } else {
          console.log("Facebook user already exists in DB.");
        }

        return done(null, user); // Pass the found or newly created user to the callback
      } catch (error) {
        console.error("Error in Facebook Strategy:", error);
        return done(error);
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

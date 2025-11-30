require("dotenv").config();
console.log("FACEBOOK_APP_ID:", process.env.FACEBOOK_APP_ID);

const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/users");
const Role = require("../models/roles");
const bcrypt = require("bcrypt");

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "photos", "emails"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log("FULL PROFILE:", JSON.stringify(profile, null, 2));
        
        const email = profile?.emails?.[0]?.value || null;
        const avatar = profile?.photos?.[0]?.value || 
                      profile?._json?.picture?.data?.url || 
                      null;

        console.log("Extracted email:", email);
        console.log("Extracted avatar:", avatar);


        let user = await User.findOne({ 
          $or: [
            { facebookId: profile.id },
            { email: email || `facebook_${profile.id}@placeholder.com` }
          ]
        });
        
        if (!user) {
          // Chỉ tạo user mới nếu chưa tồn tại
          console.log("Creating new Facebook user...");
          
          const hashedPassword = await bcrypt.hash("123456", 10);
          const id_role = await Role.findOne({ name: "User" });
          
          const newUser = new User({
            facebookId: profile.id,
            full_name: profile.displayName,
            email: email || `facebook_${profile.id}@placeholder.com`,
            image: avatar || "",
            password: hashedPassword,
            id_roles: id_role?._id || null,
            verify_email: email ? false : null,
            active: true, //Kích hoạt luôn khi đăng ký qua Facebook
            lastAccessTime: new Date()
          });
          
          user = await newUser.save(); // Gán lại user = newUser
          console.log("✅ Created new Facebook user:", user._id);
          
        } else {
          // Nếu user đã tồn tại, CẬP NHẬT facebookId (nếu chưa có)
          console.log("Facebook user already exists:", user._id);
          
          if (!user.facebookId) {
            user.facebookId = profile.id;
          }
          
          // Cập nhật thông tin mới nhất
          if (avatar && !user.image) {
            user.image = avatar;
          }
          
          user.lastAccessTime = new Date();
          await user.save();

          console.log("✅ User saved successfully:", {
            id: user._id,
            email: user.email,
            facebookId: user.facebookId
            });
          console.log("✅ Updated existing user");
        }

        return done(null, user);
        
      } catch (error) {
        console.error("Error in Facebook Strategy:", error);
        return done(error);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
require("dotenv").config();
const mongoose = require("mongoose");
console.log("BD",process.env.MONGO_URI)
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      autoIndex: true,
      socketTimeoutMS: 45000,  // Thời gian chờ cho các thao tác
      connectTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB", mongoose.connection.name);
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};

module.exports = connectToDatabase;

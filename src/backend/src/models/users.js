const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    id_roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    image: {
      type: String,
    },
    active: {
      type: Boolean,
    },
    verify_email: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

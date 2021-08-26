const mongoose = require("mongoose")

// User schema definition (with auto timestamps) using mongoose
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      max: 20,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    tweets: {
      type: Array,
      default: [],
    },
    retweets: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
)

// User module export
module.exports = mongoose.model("User", UserSchema)

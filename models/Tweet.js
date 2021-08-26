const mongoose = require("mongoose")

// Tweet schema definition (with auto timestamps) using mongoose
const TweetSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
      max: 240,
    },
    liked: {
      type: Array,
      default: [],
    },
    retweeted: {
      type: Array,
      default: [],
    },
    threadOpt: {
      type: Object,
      default: {
        isThread: false,
        threadID: null,
      },
    },
  },
  { timestamps: true }
)

// Tweet module export
module.exports = mongoose.model("Tweet", TweetSchema)

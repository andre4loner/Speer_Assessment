const mongoose = require("mongoose")

// Session schema definition (with auto timestamps) using mongoose
const SessionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    expires: {
      type: String,
      default: null
    },
    session: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
)

// Session module export
module.exports = mongoose.model("Session", SessionSchema)

const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const mongoose = require("mongoose")
// Session handlers
const session = require("express-session")
const MongoDBSession = require("connect-mongodb-session")(session)
// API routes
const authRoute = require("./routes/auth.js")
const tweetsRoute = require("./routes/tweets.js")

const app = express()
dotenv.config()

const store = new MongoDBSession({
  uri: process.env.MONGO_URI,
  databaseName: "speer_assessment",
  collection: "sessions",
  expires: 1000 * 60 * 60 * 24 * 3, // 3 days
}) // Configuring MongoDB session storage

app.use(
  session({
    secret: "SECRET_KEY",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
) // Configuring express session

app.use(morgan("dev")) // Logs requests on the server
app.use(express.json()) // Allows app to use JSON
app.use(express.urlencoded({ extended: true })) // Gives app access to response body

// Configuring app routes
app.use("/api/auth", authRoute)
app.use("/api/tweets", tweetsRoute)
// Error handling
// app.use((req, res, next) => {
//   const err = new Error("Not found")
//   err.status = 404
//   next(err)
// })
// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({
//     error: {
//       name: err.name,
//       message: err.message,
//     }
//   })
// })

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("--> App connected to MongoDB database.")
  })
  .catch((err) => {
    throw err
  }) // Connects app to MongoDB database

app.get("/", (req, res) => {
  req.session.isAuth = true
  console.log(req.session)
  console.log(req.session.id)
  res.status(200).send("Welcome to twitter...")
})

const PORT = process.env.PORT || 7333
app.listen(PORT, () => {
  console.log(`--> Server up and running on port ${PORT}.`)
})

module.exports = app
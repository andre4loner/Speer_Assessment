const router = require("express").Router()
const bcrypt = require("bcrypt")
// User schema
const User = require("../models/User.js")

// const isAuth = (req, res, next) => {
//   if (req.session.isAuth) {
//     next()
//   } else {
//     res.redirect("/login")
//   }
// }


// Registering user
router.post("/register", async (req, res) => {
  // Password variable here is reqPassword because another variable
  // with the name "password" is initialized later in this function
  const username = req.body.username
  const reqPassword = req.body.password
  if (!username || !reqPassword) {
    return res.status(400).json("Username or password not provided.")
  }
  
  try {
    // Checking for user with same username in database
    const temp = await User.findOne({ username })

    if (temp !== null) {
      return res.status(403).json("User already exists with that username.")
    } else {
      // Encrypting password using bcrypt
      const hashedPassword = await bcrypt.hash(
        reqPassword,
        await bcrypt.genSalt(10)
      )

      const user = new User({
        username: username,
        password: hashedPassword,
      })
      // Saving user to database
      const savedUser = await user.save()
      // Destructuring savedUser object to retrieve relevant info using spread
      const { createdAt, updatedAt, password, __v, ...other } = savedUser._doc

      req.session.isAuth = true
      req.session.userID = user._id.toHexString()
      return res.status(200).json(other)
    }
  } catch (err) {
    res.status(500).json("Internal server error.")
    throw err
  }
})


// Logging in user
router.post("/login", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json("Username or password not provided.")
  }

  try {
    // Checking for user with username in database
    const user = await User.findOne({ username })

    if (!user) {
      return res.status(404).json("No user found with that username.")
    } else {
      // Encrypting and comparing password with encrypted password in database
      const isPasswordMatch = await bcrypt.compare(password, user.password)

      if (isPasswordMatch) {
        // Destructuring user object to retrieve only relevant info
        const { createdAt, updatedAt, password, __v, ...other } = user._doc

        req.session.isAuth = true // Starts session
        req.session.userID = user._id.toHexString()
        return res.status(200).json(other)
      } else {
        return res.status(400).redirect("/login").json("Password is incorrect.")
      }
    }
  } catch (err) {
    res.status(500).json("Internal server error.")
    throw err
  }
})


// Logging out user
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err
  })
  res.status(200).json({ sessionID: null})
})

module.exports = router

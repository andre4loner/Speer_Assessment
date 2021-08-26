const router = require("express").Router()
const mongoose = require("mongoose")
// Tweet, User and Session schemas
const Tweet = require("../models/Tweet.js")
const User = require("../models/User.js")
const Session = require("../models/Session.js")
  

// Getting tweet
router.get("/get/:id", async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
    if (tweet) {
      return res.status(404).json("No tweet found with that ID.")
    } else {
      return res.status(200).json(tweet)
    }
  } catch (err) {
    res.status(500).json(err)
    throw err
  }
})


// Creating tweet
router.post("/create", async (req, res) => {
  const { userID, desc, threadOpt } = req.body

  if (!userID || !desc) {
    return res.status(400).json("User ID or description not provided.")
  }

  try {
    // Checking to see if requesting user is in session in database
    const store = await Session.findOne({_id: req.session.id})

    if (!store ||
      store.session.userID !== req.body.userID) {
      return res
        .status(403)
        .json("You do not have authorization to create tweet.")
    } else {
      const tweet = new Tweet({ userID, desc })
      // Threading: essentially, client sends a "threadOpt" object in request body if
      // tweets are part of a thread, and then assigns a threadID to all the related tweets.
      // Tweets are then served back to the client on request and are sorted according to
      // "createdAt" attribute to find order of the tweets in thread
      if (threadOpt) {
        tweet.threadOpt = threadOpt
      }
      const savedTweet = await tweet.save() // Saves tweet to database
      await user.updateOne({
        $push: { tweets: savedTweet._id.toHexString() },
      }) // Adds tweet's ID to array of user's tweets
      return res.status(200).json("Tweet created.")
    }
  } catch (err) {
    res.status(500).json(err)
    throw err
  }
})


// Deleting tweet
router.delete("/delete/:id", async (req, res) => {
  const tweetID = req.params.id
  const { userID } = req.body

  if (!userID) {
    return res.status(400).json("User ID not provided.")
  }

  try {
    // Checking to see if requesting user is in session in database
    const store = await Session.findOne({_id: req.session.id})
    // Retrieving tweet and user(to check if owner of tweet or admin) from database
    const tweet = await Tweet.findById(tweetID)
    const user = await User.findById(userID)
    
    // Setting error codes
    if (!tweet || !user) {
      return res
        .status(404)
        .json("Tweet or user not found with given IDs.")
    } else if (
      !store ||
      store.session.userID !== userID ||
      (user._id.toHexString() !== tweet.userID && user.isAdmin !== true)
    ) {
      return res
        .status(403)
        .json("You do not have authorization to delete that tweet.")
    } else {
      await Tweet.findByIdAndDelete(tweetID) // Deletes tweet from database
      await user.updateOne({
        $pull: { tweets: tweet._id.toHexString() },
      }) // Removes tweet's ID from array of user's tweets
      return res.status(200).json("Tweet deleted.")
    }
  } catch (err) {
    res.status(500).json(err)
    throw err
  }
})


// Updating tweet
router.put("/update/:id", async (req, res) => {
  const tweetID = req.params.id
  const { userID, desc } = req.body

  if (!userID || !desc) {
    return res.status(400).json("User ID or description not provided.")
  }

  try {
    // Checking to see if requesting user is in session in database
    const store = await Session.findOne({_id: req.session.id})
    // Retrieving tweet and user from database
    const tweet = await Tweet.findById(tweetID)
    const user = await User.findById(userID)
    
    // Setting error codes
    if (!tweet || !user) {
      return res.status(404).json("Tweet or user not found with given IDs.")
    } else if (!store ||
      store.session.userID !== userID ||
      user._id.toHexString() !== tweet.userID) {
      return res
        .status(403)
        .json("You do not have authorization to update that tweet.")
    } else {
      await tweet.updateOne({ $set: req.body }) // Updates tweet in database
      return res.status(200).json("Tweet updated.")
    }
  } catch (err) {
    res.status(500).json(err)
  }
})


// Liking/Unliking tweet
router.put("/like/:id", async (req, res) => {
  const tweetID = req.params.id
  const { userID} = req.body

  if (!userID) {
    return res.status(400).json("User ID not provided.")
  }

  try {
    // Checking to see if requesting user is in session in database
    const store = await Session.findOne({_id: req.session.id})
    // Retrieving tweet and user from database
    const tweet = await Tweet.findById(tweetID)
    const user = await User.findById(userID)
    
    // Setting error codes
    if (!tweet || !user) {
      return res.status(404).json("Tweet or user not found with given IDs.")
    } else if (!store || store.session.userID !== userID) {
      return res
        .status(403)
        .json("You do not have authorization to like tweet.")
    } else {
      if (!user.likes.includes(tweet._id)) {
        await tweet.updateOne({
          $push: { liked: user._id.toHexString() },
        }) // Adds user's ID to tweet's "liked" array
        await user.updateOne({
          $push: { likes: tweet._id.toHexString() },
        }) // Adds tweet's ID to user's "likes" array
        return res.status(200).json("Tweet liked.")
      } else {
        await tweet.updateOne({
          $pull: { liked: user._id.toHexString() },
        }) // Removes user's ID from tweet's "liked" array
        await user.updateOne({
          $pull: { likes: tweet._id.toHexString() },
        }) // Removes tweet's ID from user's "likes" array
        return res.status(200).json("Tweet unliked.")
      }
    }
  } catch (err) {
    res.status(500).json("Internal server error.")
    throw err
  }
})


// Retweeting/Un-retweeting
router.put("/retweet/:id", async (req, res) => {
  const tweetID = req.params.id
  const { userID } = req.body

  if (!userID) {
    return res.status(400).json("User ID not provided.")
  }

  try {
    // Checking to see if requesting user is in session in database
    const store = await Session.findOne({_id: req.session.id})
    // Retrieving tweet and user from database
    const tweet = await Tweet.findById(tweetID)
    const user = await Tweet.findById(userID)

    // Setting error codes
    if (!tweet || !user) {
      res.status(404).json("Tweet or user not found with given IDs.")
    } else if (
      !store ||
      store.session.userID !== userID ||
      user._id.toHexString() === tweet.userID) {
      return res
        .status(403)
        .json("You do not have authorization to retweet.")
    } else {
      if (!user.retweets.includes(tweet._id)) {
        await tweet.updateOne({
          $push: { retweeted: user._id.toHexString() },
        }) // Adds user's ID to tweet's "retweeted" array
        await user.updateOne({
          $push: { retweets: post._id.toHexString() },
        }) // Adds tweet's ID to user's "retweets" array
        return res.status(200).json("Tweet retweeted.")
      } else {
        await tweet.updateOne({
          $pull: { retweeted: user._id.toHexString() },
        }) // Removes user's ID from tweet's "retweeted" array
        await user.updateOne({
          $pull: { retweets: post._id.toHexString() },
        }) // Removes tweet's ID from user's "retweets" array
        return res.status(200).json("Tweet un-retweeted.")
      }
    }
  } catch (err) {
    res.status(500).json("Internal server error")
    throw err
  }
})

module.exports = router
